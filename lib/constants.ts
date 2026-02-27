import type {
  OccurrenceCategory,
  OccurrenceStatus,
  UserRole,
} from "@/types/database";

export const OCCURRENCE_CATEGORIES = [
  "buraco",
  "iluminacao",
  "lixo",
  "entulho",
  "esgoto",
  "outros",
] as const satisfies readonly OccurrenceCategory[];

export const OCCURRENCE_STATUSES = [
  "aberto",
  "em_analise",
  "em_execucao",
  "resolvido",
] as const satisfies readonly OccurrenceStatus[];

export const USER_ROLES = [
  "citizen",
  "agent",
  "admin",
  "gestor",
] as const satisfies readonly UserRole[];

export const CATEGORY_LABELS: Record<OccurrenceCategory, string> = {
  buraco: "Buraco",
  iluminacao: "Iluminação pública",
  lixo: "Lixo urbano",
  entulho: "Entulho",
  esgoto: "Esgoto",
  outros: "Outros",
};

export const STATUS_LABELS: Record<OccurrenceStatus, string> = {
  aberto: "Aberto",
  em_analise: "Em análise",
  em_execucao: "Em execução",
  resolvido: "Resolvido",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  citizen: "Cidadão",
  agent: "Agente",
  admin: "Administrador",
  gestor: "Gestor",
};

export const CATEGORY_SLA_HOURS: Record<OccurrenceCategory, number> = {
  buraco: 72,
  iluminacao: 48,
  lixo: 36,
  entulho: 96,
  esgoto: 24,
  outros: 120,
};

export const CATEGORY_SEVERITY_WEIGHT: Record<OccurrenceCategory, number> = {
  esgoto: 10,
  buraco: 8,
  iluminacao: 6,
  lixo: 5,
  entulho: 4,
  outros: 3,
};

export const STATUS_COLORS: Record<OccurrenceStatus, string> = {
  aberto: "bg-red-100 text-red-700 border-red-200",
  em_analise: "bg-amber-100 text-amber-700 border-amber-200",
  em_execucao: "bg-blue-100 text-blue-700 border-blue-200",
  resolvido: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export const MAP_DEFAULT_CENTER = {
  lat: -15.793889,
  lng: -47.882778,
};

export const MAP_DEFAULT_ZOOM = 12;
