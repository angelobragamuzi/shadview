import { resolveAgentApiContext } from "@/lib/agent/api-context";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function sanitizeFileName(fileName: string) {
  return fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.\-_]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

function getFileExtension(file: File) {
  const normalizedName = sanitizeFileName(file.name || "resolucao");
  const nameParts = normalizedName.split(".");
  const rawExt = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

  if (rawExt && rawExt.length <= 5) {
    return rawExt;
  }

  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

export async function POST(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  const { context: agentContext, response } = await resolveAgentApiContext(request);

  if (!agentContext) {
    return response as NextResponse;
  }

  const { id: occurrenceId } = await context.params;
  const { supabaseAdmin, agent, user } = agentContext;

  const { data: assignmentData, error: assignmentError } = await supabaseAdmin
    .from("occurrence_assignments")
    .select("id")
    .eq("occurrence_id", occurrenceId)
    .eq("agent_id", agent.id)
    .maybeSingle();

  if (assignmentError) {
    return NextResponse.json({ error: assignmentError.message }, { status: 500 });
  }

  if (!assignmentData) {
    return NextResponse.json(
      { error: "Ocorrência não vinculada ao agente autenticado." },
      { status: 404 },
    );
  }

  const { data: occurrenceData, error: occurrenceError } = await supabaseAdmin
    .from("occurrences")
    .select("*")
    .eq("id", occurrenceId)
    .maybeSingle();

  if (occurrenceError) {
    return NextResponse.json({ error: occurrenceError.message }, { status: 500 });
  }

  if (!occurrenceData) {
    return NextResponse.json({ error: "Ocorrência não encontrada." }, { status: 404 });
  }

  if (occurrenceData.status === "resolvido") {
    return NextResponse.json(
      { error: "Esta ocorrência já está resolvida." },
      { status: 409 },
    );
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      {
        error:
          "Formato inválido. Envie a finalização em multipart/form-data com campo `images`.",
      },
      { status: 400 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Não foi possível ler os dados enviados para finalização." },
      { status: 400 },
    );
  }

  const rawComment = formData.get("comment");
  const comment = typeof rawComment === "string" ? rawComment.trim() : "";
  const files = formData
    .getAll("images")
    .filter((value): value is File => value instanceof File);

  if (files.length === 0) {
    return NextResponse.json(
      {
        error:
          "Envie pelo menos uma foto de resolução para finalizar a ocorrência.",
      },
      { status: 400 },
    );
  }

  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Todos os arquivos enviados devem ser imagens válidas." },
        { status: 400 },
      );
    }

    if (file.size <= 0) {
      return NextResponse.json(
        { error: "Uma ou mais imagens enviadas estão vazias." },
        { status: 400 },
      );
    }
  }

  const uploadedPaths: string[] = [];
  const insertedImageIds: string[] = [];
  let occurrenceUpdated = false;

  try {
    const uploadedImageUrls: string[] = [];

    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const extension = getFileExtension(file);
      const filePath = `${occurrenceId}/resolution/${agent.id}/${Date.now()}-${index}.${extension}`;
      const arrayBuffer = await file.arrayBuffer();

      const { error: uploadError } = await supabaseAdmin.storage
        .from("occurrence-images")
        .upload(filePath, arrayBuffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      uploadedPaths.push(filePath);

      const { data: publicUrlData } = supabaseAdmin.storage
        .from("occurrence-images")
        .getPublicUrl(filePath);

      uploadedImageUrls.push(publicUrlData.publicUrl);
    }

    const { data: insertedImages, error: imageInsertError } = await supabaseAdmin
      .from("occurrence_images")
      .insert(
        uploadedImageUrls.map((imageUrl) => ({
          occurrence_id: occurrenceId,
          image_url: imageUrl,
          image_type: "resolution" as const,
        })),
      )
      .select("id, occurrence_id, image_url, image_type, created_at");

    if (imageInsertError) {
      throw new Error(imageInsertError.message);
    }

    for (const insertedImage of insertedImages ?? []) {
      insertedImageIds.push(insertedImage.id);
    }

    const { data: resolvedOccurrence, error: occurrenceUpdateError } = await supabaseAdmin
      .from("occurrences")
      .update({
        status: "resolvido",
        updated_at: new Date().toISOString(),
      })
      .eq("id", occurrenceId)
      .select("*")
      .single();

    if (occurrenceUpdateError) {
      throw new Error(occurrenceUpdateError.message);
    }

    occurrenceUpdated = true;

    const { error: logError } = await supabaseAdmin.from("occurrence_logs").insert({
      occurrence_id: occurrenceId,
      actor_id: user.id,
      status: "resolvido",
      comment: comment || "Ocorrência finalizada pelo agente com foto de resolução.",
      is_internal: true,
    });

    if (logError) {
      throw new Error(logError.message);
    }

    return NextResponse.json({
      occurrence: resolvedOccurrence,
      resolutionImages: insertedImages ?? [],
    });
  } catch (error) {
    if (occurrenceUpdated) {
      await supabaseAdmin
        .from("occurrences")
        .update({
          status: occurrenceData.status,
          updated_at: occurrenceData.updated_at,
        })
        .eq("id", occurrenceId);
    }

    if (insertedImageIds.length > 0) {
      await supabaseAdmin.from("occurrence_images").delete().in("id", insertedImageIds);
    }

    if (uploadedPaths.length > 0) {
      await supabaseAdmin.storage.from("occurrence-images").remove(uploadedPaths);
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível finalizar a ocorrência com as imagens enviadas.",
      },
      { status: 500 },
    );
  }
}
