import { NextResponse } from "next/server";
import { getBotConnectorStatuses } from "@/lib/bots/connectors";
import { checkGeminiBridgeHealth, isGeminiBridgeConfigured } from "@/lib/ai/gemini-bridge";
import { checkOpenAiBridgeHealth, isOpenAiBridgeConfigured } from "@/lib/ai/openai-bridge";

export async function GET() {
  const [geminiHealth, openAiHealth] = await Promise.all([
    checkGeminiBridgeHealth(),
    checkOpenAiBridgeHealth(),
  ]);

  return NextResponse.json({
    aiProvider: geminiHealth.connected ? "gemini" : openAiHealth.connected ? "openai" : "none",
    aiConnected: geminiHealth.connected || openAiHealth.connected,
    geminiConfigured: isGeminiBridgeConfigured(),
    geminiConnected: geminiHealth.connected,
    geminiStatusCode: geminiHealth.statusCode,
    geminiDetail: geminiHealth.detail,
    openAiConfigured: isOpenAiBridgeConfigured(),
    openAiAuthenticated: openAiHealth.authenticated,
    openAiConnected: openAiHealth.connected,
    openAiStatusCode: openAiHealth.statusCode,
    openAiDetail: openAiHealth.detail,
    connectors: getBotConnectorStatuses(),
    generatedAt: new Date().toISOString(),
  });
}
