import { executeAgentMission } from "@/lib/agent/executor";
import { planMission } from "@/lib/agent/planner";
import { appendHenryFeedTurn } from "@/lib/ai/conversation-store";
import { getOpenAiOperatorResponse } from "@/lib/ai/openai-bridge";
import type { ActionResult } from "@/lib/actions/action-types";
import type { JarvisApiRequest, JarvisApiResponse } from "@/lib/ai/types";

export async function runJarvisCommand(request: JarvisApiRequest): Promise<JarvisApiResponse> {
  const context = {
    actorRole: request.actorRole,
    readOnlyMode: request.readOnlyMode,
    command: request.command,
  };
  const mission = planMission(request.command, request.readOnlyMode);
  const agent = await executeAgentMission(mission, context);
  const recommendedActions = recommendNextActions(agent.actions);
  const openAiBridge = await getOpenAiOperatorResponse({ command: request.command, agent });
  const responseContent = openAiBridge.connected ? openAiBridge.content : formatAiUnavailableResponse(openAiBridge.content, openAiBridge.statusCode);
  const message = {
    id: crypto.randomUUID(),
    role: "assistant" as const,
    content: responseContent,
    createdAt: new Date().toISOString(),
    source: "system" as const,
  };

  await appendHenryFeedTurn({
    user: request.command,
    assistant: responseContent,
    source: request.source,
    channel: request.source === "voice" ? "browser_voice" : "chat",
    metadata: {
      actorRole: request.actorRole,
      readOnlyMode: request.readOnlyMode,
      openAiConnected: openAiBridge.connected,
      missionId: agent.mission.id,
      pendingApprovalCount: agent.pendingApprovals.length,
    },
  });

  return {
    actions: agent.actions,
    recommendedActions,
    agent,
    openAiBridge,
    message,
  };
}

function recommendNextActions(actions: ActionResult[]) {
  if (actions.some((action) => action.level === 3)) {
    return actions.filter((action) => action.level === 3);
  }

  return [];
}

function formatAiUnavailableResponse(bridgeStatus: string, statusCode?: number) {
  if (statusCode === 401) {
    return "Henry IV's real AI core is blocked because Railway's OPENAI_API_KEY is being rejected by OpenAI. I will not fake an answer from the local machine. Replace OPENAI_API_KEY with a valid key, then voice and chat will use the real agent.";
  }

  return `Henry IV's real AI core is not available. I will not fake an answer from the local machine. ${bridgeStatus}`;
}
