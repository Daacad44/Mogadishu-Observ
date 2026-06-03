import type { Profile } from "@/types";
import { canAccessAdminDashboard } from "./roles";

/** Where to send the user after a successful login. */
export function getPostLoginRedirect(
  profile: Profile | null,
  requestedRedirect?: string | null
): string {
  if (requestedRedirect && requestedRedirect !== "/dashboard" && requestedRedirect !== "/admin") {
    return requestedRedirect;
  }

  if (canAccessAdminDashboard(profile)) {
    return "/dashboard";
  }

  return "/";
}
