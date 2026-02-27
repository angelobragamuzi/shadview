import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { OccurrenceImageType } from "@/types";

const OCCURRENCE_BUCKET = "occurrence-images";

function sanitizeFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, "-")
    .replace(/-+/g, "-");
}

export async function uploadOccurrenceImages({
  files,
  occurrenceId,
  imageType = "report",
}: {
  files: File[];
  occurrenceId: string;
  imageType?: OccurrenceImageType;
}) {
  const supabase = createBrowserSupabaseClient();
  const { data: authData } = await supabase.auth.getUser();

  if (imageType === "resolution" && !authData.user) {
    throw new Error("Apenas gestores autenticados podem anexar imagens de resolução.");
  }

  const uploadedUrls: string[] = [];

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const filePath = `${occurrenceId}/${imageType}/${Date.now()}-${index}-${sanitizeFileName(file.name)}`;

    const { error: uploadError } = await supabase.storage
      .from(OCCURRENCE_BUCKET)
      .upload(filePath, file, {
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicUrlData } = supabase.storage
      .from(OCCURRENCE_BUCKET)
      .getPublicUrl(filePath);
    uploadedUrls.push(publicUrlData.publicUrl);
  }

  const { error: imageInsertError } = await supabase
    .from("occurrence_images")
    .insert(
      uploadedUrls.map((imageUrl) => ({
        occurrence_id: occurrenceId,
        image_url: imageUrl,
        image_type: imageType,
      })),
    );

  if (imageInsertError) {
    throw imageInsertError;
  }

  return uploadedUrls;
}

