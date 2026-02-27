import type { Database } from "@/types/database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Occurrence = Database["public"]["Tables"]["occurrences"]["Row"];
export type OccurrenceImage =
  Database["public"]["Tables"]["occurrence_images"]["Row"];
export type OccurrenceLog =
  Database["public"]["Tables"]["occurrence_logs"]["Row"];
export type Rating = Database["public"]["Tables"]["ratings"]["Row"];
export type Institution = Database["public"]["Tables"]["institutions"]["Row"];
export type Team = Database["public"]["Tables"]["teams"]["Row"];
export type OperationalAgent =
  Database["public"]["Tables"]["operational_agents"]["Row"];
export type OccurrenceAssignment =
  Database["public"]["Tables"]["occurrence_assignments"]["Row"];

export type UserRole = Database["public"]["Enums"]["user_role"];
export type OccurrenceCategory = Database["public"]["Enums"]["occurrence_category"];
export type OccurrenceStatus = Database["public"]["Enums"]["occurrence_status"];
export type OccurrenceImageType =
  Database["public"]["Enums"]["occurrence_image_type"];

export interface OccurrenceWithRelations extends Occurrence {
  reporter?: Pick<Profile, "id" | "full_name" | "role"> | null;
  assignee?: Pick<Profile, "id" | "full_name" | "role"> | null;
  assignment?:
    | (OccurrenceAssignment & {
        institution?: Pick<Institution, "id" | "name" | "acronym"> | null;
        team?: Pick<Team, "id" | "name"> | null;
        agent?: Pick<OperationalAgent, "id" | "full_name"> | null;
      })
    | null;
  occurrence_images?: OccurrenceImage[];
  occurrence_logs?: OccurrenceLog[];
  ratings?: Rating[];
}

export interface DashboardMetrics {
  total: number;
  byCategory: Record<string, number>;
  byNeighborhood: Record<string, number>;
  byStatus: Record<string, number>;
  avgResolutionHours: number;
  monthlyComparison: Array<{
    month: string;
    abertas: number;
    resolvidas: number;
  }>;
}

export interface OccurrenceFilters {
  from?: string;
  to?: string;
  category?: OccurrenceCategory;
  status?: OccurrenceStatus;
  neighborhood?: string;
}
