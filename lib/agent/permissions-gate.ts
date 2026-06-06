import { dangerousActions, hasPermission, permissionMessage } from "@/lib/security/permissions";
import type { JarvisActionName, UserRole } from "@/lib/actions/action-types";

export type PermissionGateResult = {
  allowed: boolean;
  approvalRequired: boolean;
  summary: string;
};

export function checkAgentPermissions(actionNames: JarvisActionName[], actorRole: UserRole, readOnlyMode: boolean): PermissionGateResult {
  const sensitiveActions = actionNames.filter((actionName) => dangerousActions.has(actionName));
  const approvalRequired = sensitiveActions.length > 0;

  if (approvalRequired) {
    return {
      allowed: false,
      approvalRequired: true,
      summary: `${sensitiveActions.join(", ")} requires owner approval. ${readOnlyMode ? "Read-only mode blocks execution." : "Dry-run only until approved."}`,
    };
  }

  const blocked = actionNames.find((actionName) => !hasPermission(actorRole, actionName.startsWith("get") || actionName === "summarizeDay" ? ["customer"] : ["admin"]));

  if (blocked) {
    return {
      allowed: false,
      approvalRequired: false,
      summary: permissionMessage(blocked, ["admin"]),
    };
  }

  return {
    allowed: true,
    approvalRequired: false,
    summary: "Permission gate passed for dry-run execution.",
  };
}
