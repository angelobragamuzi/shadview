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
  aberto:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300",
  em_analise:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
  em_execucao:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300",
  resolvido:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
};

export const MAP_DEFAULT_CENTER = {
  lat: -15.793889,
  lng: -47.882778,
};

export const MAP_DEFAULT_ZOOM = 12;
