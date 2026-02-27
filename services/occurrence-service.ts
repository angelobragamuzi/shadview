import { calculateSlaDeadline, resolutionHours } from "@/lib/occurrence-utils";
import type {
  CreateOccurrenceFormValues,
  ManageOccurrenceFormValues,
  RatingFormValues,
} from "@/lib/schemas/occurrence";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { geocodeAddress } from "@/services/geolocation-service";
import type {
  DashboardMetrics,
  Institution,
  Occurrence,
  OccurrenceFilters,
  OccurrenceWithRelations,
  OperationalAgent,
  Profile,
  Team,
} from "@/types";

export type CreateInstitutionInput = {
  name: string;
  acronym?: string;
  contactEmail?: string;
  contactPhone?: string;
};

export type CreateTeamInput = {
  institutionId: string;
  name: string;
  description?: string;
};

export type CreateOperationalAgentInput = {
  fullName: string;
  email: string;
  phone: string;
  institutionId?: string | null;
  teamId?: string | null;
};

function normalizeOccurrenceWithRelations(row: any): OccurrenceWithRelations {
  const assignmentSource = row?.assignment;
  const assignment = Array.isArray(assignmentSource)
    ? assignmentSource[0] ?? null
    : assignmentSource ?? null;

  return {
    ...row,
    assignment,
  } as OccurrenceWithRelations;
}

export async function createOccurrence(
  values: CreateOccurrenceFormValues,
  userId?: string | null,
): Promise<Occurrence> {
  const supabase = createBrowserSupabaseClient();
  const now = new Date();
  const coordinates = await geocodeAddress({
    street: values.street,
    addressNumber: values.addressNumber,
    neighborhood: values.neighborhood,
    city: values.city,
    state: values.state,
    postalCode: values.postalCode,
  });

  if (!coordinates) {
    throw new Error("Não foi possível localizar o endereço informado.");
  }

  const { data: occurrence, error } = await supabase
    .from("occurrences")
    .insert({
      user_id: userId ?? null,
      title: values.title,
      description: values.description,
      category: values.category,
      status: "aberto",
      latitude: coordinates.lat,
      longitude: coordinates.lng,
      neighborhood: values.neighborhood || null,
      sla_deadline: calculateSlaDeadline(values.category, now),
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return occurrence as Occurrence;
}

export async function fetchPublicOccurrences(limit = 300) {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase.rpc("get_public_occurrences", {
    limit_count: limit,
  });

  if (error) {
    throw error;
  }

  return (data ?? []) as Occurrence[];
}

export async function fetchOccurrenceById(occurrenceId: string) {
  const supabase = createBrowserSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data, error } = await supabase
      .from("occurrences")
      .select(
        `
        *,
        occurrence_images(*),
        occurrence_logs(*),
        ratings(*),
        reporter:profiles!occurrences_user_id_fkey(id, full_name, role),
        assignee:profiles!occurrences_assigned_to_fkey(id, full_name, role),
        assignment:occurrence_assignments(
          id,
          occurrence_id,
          institution_id,
          team_id,
          agent_id,
          assigned_by,
          notes,
          assigned_at,
          created_at,
          updated_at,
          institution:institutions(id, name, acronym),
          team:teams(id, name),
          agent:operational_agents(id, full_name)
        )
      `,
      )
      .eq("id", occurrenceId)
      .maybeSingle();

    if (!error && data) {
      return normalizeOccurrenceWithRelations(data);
    }
  }

  const { data: publicOccurrence, error: occurrenceError } = await supabase.rpc(
    "get_public_occurrence",
    {
      occurrence_uuid: occurrenceId,
    },
  );

  if (occurrenceError) {
    throw occurrenceError;
  }

  const publicRows = (publicOccurrence ?? []) as Occurrence[];
  if (publicRows.length === 0) {
    return null;
  }

  const [{ data: publicLogs }, { data: publicImages }] = await Promise.all([
    supabase.rpc("get_public_occurrence_logs", { occurrence_uuid: occurrenceId }),
    supabase.rpc("get_public_occurrence_images", { occurrence_uuid: occurrenceId }),
  ]);

  return {
    ...publicRows[0],
    reporter: null,
    assignee: null,
    occurrence_logs: (publicLogs ?? []) as OccurrenceWithRelations["occurrence_logs"],
    occurrence_images: (publicImages ?? []) as OccurrenceWithRelations["occurrence_images"],
    ratings: [],
  };
}

export async function fetchMyOccurrences(userId: string) {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .from("occurrences")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as Occurrence[];
}

export async function fetchDashboardOccurrences(
  filters: OccurrenceFilters = {},
) {
  const supabase = createBrowserSupabaseClient();
  let query = supabase
    .from("occurrences")
    .select(
      `
      *,
      occurrence_images(*),
      occurrence_logs(*),
      reporter:profiles!occurrences_user_id_fkey(id, full_name, role),
      assignee:profiles!occurrences_assigned_to_fkey(id, full_name, role),
      assignment:occurrence_assignments(
        id,
        occurrence_id,
        institution_id,
        team_id,
        agent_id,
        assigned_by,
        notes,
        assigned_at,
        created_at,
        updated_at,
        institution:institutions(id, name, acronym),
        team:teams(id, name),
        agent:operational_agents(id, full_name)
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.neighborhood) {
    query = query.ilike("neighborhood", `%${filters.neighborhood}%`);
  }

  if (filters.from) {
    query = query.gte("created_at", filters.from);
  }

  if (filters.to) {
    query = query.lte("created_at", filters.to);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => normalizeOccurrenceWithRelations(row));
}

export async function fetchAgents() {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "agent")
    .order("full_name", { ascending: true });

  if (error) {
    throw error;
  }

  return data as Profile[];
}

export async function fetchInstitutions() {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .from("institutions")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as Institution[];
}

export async function fetchTeams() {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as Team[];
}

export async function fetchOperationalAgents() {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .from("operational_agents")
    .select("*")
    .eq("is_active", true)
    .order("full_name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as OperationalAgent[];
}

export async function createInstitution(
  values: CreateInstitutionInput,
  createdBy?: string | null,
) {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .from("institutions")
    .insert({
      name: values.name.trim(),
      acronym: values.acronym?.trim() || null,
      contact_email: values.contactEmail?.trim() || null,
      contact_phone: values.contactPhone?.trim() || null,
      created_by: createdBy ?? null,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as Institution;
}

export async function createTeam(
  values: CreateTeamInput,
  createdBy?: string | null,
) {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .from("teams")
    .insert({
      institution_id: values.institutionId,
      name: values.name.trim(),
      description: values.description?.trim() || null,
      created_by: createdBy ?? null,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as Team;
}

export async function createOperationalAgent(
  values: CreateOperationalAgentInput,
  createdBy?: string | null,
) {
  const email = values.email.trim();
  const phone = values.phone.trim();

  if (!email) {
    throw new Error("Informe o e-mail do agente.");
  }
  if (!phone) {
    throw new Error("Informe o telefone do agente.");
  }

  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .from("operational_agents")
    .insert({
      full_name: values.fullName.trim(),
      email,
      phone,
      institution_id: values.institutionId || null,
      team_id: values.teamId || null,
      created_by: createdBy ?? null,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as OperationalAgent;
}

export async function manageOccurrence(
  occurrenceId: string,
  values: ManageOccurrenceFormValues,
  actorId?: string | null,
) {
  const supabase = createBrowserSupabaseClient();
  const { data: updatedOccurrence, error: updateError } = await supabase
    .from("occurrences")
    .update({
      status: values.status,
      assigned_to: values.assignedTo,
      updated_at: new Date().toISOString(),
    })
    .eq("id", occurrenceId)
    .select("*")
    .single();

  if (updateError) {
    throw updateError;
  }

  const hasOperationalAssignment = Boolean(
    values.institutionId || values.teamId || values.operationalAgentId,
  );

  if (hasOperationalAssignment) {
    const { error: assignmentError } = await supabase
      .from("occurrence_assignments")
      .upsert(
        {
          occurrence_id: occurrenceId,
          institution_id: values.institutionId,
          team_id: values.teamId,
          agent_id: values.operationalAgentId,
          assigned_by: actorId ?? null,
          assigned_at: new Date().toISOString(),
        },
        { onConflict: "occurrence_id" },
      );

    if (assignmentError) {
      throw assignmentError;
    }
  } else {
    const { error: deleteAssignmentError } = await supabase
      .from("occurrence_assignments")
      .delete()
      .eq("occurrence_id", occurrenceId);

    if (deleteAssignmentError) {
      throw deleteAssignmentError;
    }
  }

  const { error: logError } = await supabase.from("occurrence_logs").insert({
    occurrence_id: occurrenceId,
    actor_id: actorId ?? null,
    status: values.status,
    comment: values.comment?.trim() || null,
    is_internal: values.isInternal,
  });

  if (logError) {
    throw logError;
  }

  return updatedOccurrence;
}

export async function addOccurrenceRating(
  occurrenceId: string,
  values: RatingFormValues,
  userId?: string | null,
) {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .from("ratings")
    .insert({
      occurrence_id: occurrenceId,
      user_id: userId ?? null,
      rating: values.rating,
      feedback: values.feedback?.trim() || null,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function purgeAllAppData() {
  const supabase = createBrowserSupabaseClient();

  const tableNames = [
    "occurrence_assignments",
    "occurrences",
    "operational_agents",
    "teams",
    "institutions",
  ] as const;

  for (const tableName of tableNames) {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .not("id", "is", null);

    if (error) {
      throw error;
    }
  }
}

export function buildDashboardMetrics(occurrences: Occurrence[]): DashboardMetrics {
  const byCategory: Record<string, number> = {};
  const byNeighborhood: Record<string, number> = {};
  const byStatus: Record<string, number> = {};

  let totalResolutionHours = 0;
  let resolvedCount = 0;

  for (const occurrence of occurrences) {
    byCategory[occurrence.category] = (byCategory[occurrence.category] ?? 0) + 1;
    byNeighborhood[occurrence.neighborhood ?? "Não informado"] =
      (byNeighborhood[occurrence.neighborhood ?? "Não informado"] ?? 0) + 1;
    byStatus[occurrence.status] = (byStatus[occurrence.status] ?? 0) + 1;

    const resolution = resolutionHours(occurrence);
    if (resolution !== null) {
      totalResolutionHours += resolution;
      resolvedCount += 1;
    }
  }

  const monthlyMap = new Map<string, { abertas: number; resolvidas: number }>();

  for (const occurrence of occurrences) {
    const month = new Date(occurrence.created_at).toLocaleDateString("pt-BR", {
      month: "short",
      year: "2-digit",
    });

    const current = monthlyMap.get(month) ?? { abertas: 0, resolvidas: 0 };
    current.abertas += 1;
    if (occurrence.status === "resolvido") {
      current.resolvidas += 1;
    }
    monthlyMap.set(month, current);
  }

  const monthlyComparison = Array.from(monthlyMap.entries()).map(
    ([month, values]) => ({
      month,
      abertas: values.abertas,
      resolvidas: values.resolvidas,
    }),
  );

  return {
    total: occurrences.length,
    byCategory,
    byNeighborhood,
    byStatus,
    avgResolutionHours:
      resolvedCount > 0 ? totalResolutionHours / resolvedCount : 0,
    monthlyComparison,
  };
}
