import type { UserRole, Profile } from "@/types";

export const ADMIN_ROLES: UserRole[] = ["super_admin", "admin"];

export function isAdminRole(role?: UserRole | null): boolean {
  return !!role && ADMIN_ROLES.includes(role);
}

export function isSuperAdmin(role?: UserRole | null): boolean {
  return role === "super_admin";
}

export function canAccessAdminDashboard(profile: Profile | null): boolean {
  return isAdminRole(profile?.role);
}

export function canManageUsers(profile: Profile | null): boolean {
  return profile?.role === "super_admin";
}

export function roleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    super_admin: "Super Admin",
    admin: "Admin",
    analyst: "Analyst",
    user: "User",
  };
  return labels[role];
}
