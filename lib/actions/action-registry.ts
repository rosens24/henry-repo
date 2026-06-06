import { mockActions } from "@/lib/actions/mock-actions";
import type { ActionContext, ActionResult, JarvisActionName, SafeAction } from "@/lib/actions/action-types";

export const actionRegistry = mockActions.reduce(
  (registry, action) => {
    registry[action.name] = action;

    return registry;
  },
  {} as Record<JarvisActionName, SafeAction>,
);

export async function runSafeAction(actionName: JarvisActionName, context: ActionContext): Promise<ActionResult> {
  return actionRegistry[actionName].run(context);
}
