import type { UserRole } from "@/types";

export function isDashboardRole(role?: UserRole | null): boolean {
  return role === "gestor";
}

export function isGestorRole(role?: UserRole | null): boolean {
  return role === "gestor";
}

export function canManageOccurrence(
  role?: UserRole | null,
): boolean {
  return role === "gestor";
}

export function canViewAllOccurrences(role?: UserRole | null): boolean {
  return role === "gestor";
}

export function canAssignOccurrences(role?: UserRole | null): boolean {
  return role === "gestor";
}

export function canViewInternalLogs(role?: UserRole | null): boolean {
  return role === "gestor";
}
