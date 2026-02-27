export type Json =
  | string
  | number
  | boolean
  | null
  | {
      [key: string]: Json | undefined;
    }
  | Json[];

export type UserRole = "citizen" | "agent" | "admin" | "gestor";

export type OccurrenceCategory =
  | "buraco"
  | "iluminacao"
  | "lixo"
  | "entulho"
  | "esgoto"
  | "outros";

export type OccurrenceStatus =
  | "aberto"
  | "em_analise"
  | "em_execucao"
  | "resolvido";

export type OccurrenceImageType = "report" | "resolution";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          role: UserRole;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          role?: UserRole;
          created_at?: string;
        };
        Update: {
          full_name?: string | null;
          role?: UserRole;
          created_at?: string;
        };
        Relationships: [];
      };
      occurrences: {
        Row: {
          id: string;
          user_id: string | null;
          title: string;
          description: string;
          category: OccurrenceCategory;
          status: OccurrenceStatus;
          latitude: number;
          longitude: number;
          neighborhood: string | null;
          assigned_to: string | null;
          sla_deadline: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          title: string;
          description: string;
          category: OccurrenceCategory;
          status?: OccurrenceStatus;
          latitude: number;
          longitude: number;
          neighborhood?: string | null;
          assigned_to?: string | null;
          sla_deadline?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string | null;
          title?: string;
          description?: string;
          category?: OccurrenceCategory;
          status?: OccurrenceStatus;
          latitude?: number;
          longitude?: number;
          neighborhood?: string | null;
          assigned_to?: string | null;
          sla_deadline?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      occurrence_images: {
        Row: {
          id: string;
          occurrence_id: string;
          image_url: string;
          image_type: OccurrenceImageType;
          created_at: string;
        };
        Insert: {
          id?: string;
          occurrence_id: string;
          image_url: string;
          image_type?: OccurrenceImageType;
          created_at?: string;
        };
        Update: {
          occurrence_id?: string;
          image_url?: string;
          image_type?: OccurrenceImageType;
          created_at?: string;
        };
        Relationships: [];
      };
      occurrence_logs: {
        Row: {
          id: string;
          occurrence_id: string;
          actor_id: string | null;
          status: OccurrenceStatus;
          comment: string | null;
          is_internal: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          occurrence_id: string;
          actor_id?: string | null;
          status: OccurrenceStatus;
          comment?: string | null;
          is_internal?: boolean;
          created_at?: string;
        };
        Update: {
          occurrence_id?: string;
          actor_id?: string | null;
          status?: OccurrenceStatus;
          comment?: string | null;
          is_internal?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      ratings: {
        Row: {
          id: string;
          occurrence_id: string;
          user_id: string | null;
          rating: number;
          feedback: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          occurrence_id: string;
          user_id?: string | null;
          rating: number;
          feedback?: string | null;
          created_at?: string;
        };
        Update: {
          occurrence_id?: string;
          user_id?: string | null;
          rating?: number;
          feedback?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_role: {
        Args: Record<PropertyKey, never>;
        Returns: UserRole;
      };
      can_manage_occurrence: {
        Args: {
          occurrence_uuid: string;
        };
        Returns: boolean;
      };
      get_public_occurrences: {
        Args: {
          limit_count?: number;
        };
        Returns: Array<{
          id: string;
          user_id: string | null;
          title: string;
          description: string;
          category: OccurrenceCategory;
          status: OccurrenceStatus;
          latitude: number;
          longitude: number;
          neighborhood: string | null;
          assigned_to: string | null;
          sla_deadline: string | null;
          created_at: string;
          updated_at: string;
        }>;
      };
      get_public_occurrence: {
        Args: {
          occurrence_uuid: string;
        };
        Returns: Array<{
          id: string;
          user_id: string | null;
          title: string;
          description: string;
          category: OccurrenceCategory;
          status: OccurrenceStatus;
          latitude: number;
          longitude: number;
          neighborhood: string | null;
          assigned_to: string | null;
          sla_deadline: string | null;
          created_at: string;
          updated_at: string;
        }>;
      };
      get_public_occurrence_logs: {
        Args: {
          occurrence_uuid: string;
        };
        Returns: Array<{
          id: string;
          occurrence_id: string;
          actor_id: string | null;
          status: OccurrenceStatus;
          comment: string | null;
          is_internal: boolean;
          created_at: string;
        }>;
      };
      get_public_occurrence_images: {
        Args: {
          occurrence_uuid: string;
        };
        Returns: Array<{
          id: string;
          occurrence_id: string;
          image_url: string;
          image_type: OccurrenceImageType;
          created_at: string;
        }>;
      };
    };
    Enums: {
      user_role: UserRole;
      occurrence_category: OccurrenceCategory;
      occurrence_status: OccurrenceStatus;
      occurrence_image_type: OccurrenceImageType;
    };
    CompositeTypes: Record<string, never>;
  };
}
