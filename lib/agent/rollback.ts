import type { JarvisActionName } from "@/lib/actions/action-types";

export function planRollback(actionNames: JarvisActionName[]) {
  if (actionNames.length === 0) {
    return ["No action selected; no rollback needed."];
  }

  return actionNames.map((actionName) => {
    if (actionName.startsWith("get") || actionName === "summarizeDay") {
      return `${actionName}: read-only action; no rollback needed.`;
    }

    if (actionName.startsWith("draft")) {
      return `${actionName}: discard draft before sending.`;
    }

    return `${actionName}: block autonomous execution; require manual review and provider-specific reversal plan before approval.`;
  });
}
