import type { UserRole } from "@/lib/actions/action-types";
import { hasPermission } from "@/lib/security/permissions";

export type AuthGuardResult = {
  allowed: boolean;
  reason?: string;
};

export function requireRole(actorRole: UserRole, allowedRoles: UserRole[]): AuthGuardResult {
  if (hasPermission(actorRole, allowedRoles)) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: `Admin-only placeholder guard blocked access. Required role: ${allowedRoles.join(" or ")}.`,
  };
}
