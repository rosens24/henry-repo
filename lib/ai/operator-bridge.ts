import { getGeminiOperatorResponse, isGeminiBridgeConfigured } from "@/lib/ai/gemini-bridge";
import { getOpenAiOperatorResponse, isOpenAiBridgeConfigured } from "@/lib/ai/openai-bridge";
import type { AgentRunResult } from "@/lib/agent/types";

type OperatorBridgeRequest = {
  command: string;
  agent: AgentRunResult;
};

export async function getOperatorResponse({ command, agent }: OperatorBridgeRequest) {
  if (isGeminiBridgeConfigured()) {
    const gemini = await getGeminiOperatorResponse({ command, agent });

    if (gemini.connected) return gemini;

    if (!isOpenAiBridgeConfigured()) return gemini;
  }

  const openai = await getOpenAiOperatorResponse({ command, agent });

  return {
    provider: "openai" as const,
    ...openai,
  };
}
