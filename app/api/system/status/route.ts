import { NextResponse } from "next/server";
import { getBotConnectorStatuses } from "@/lib/bots/connectors";
import { checkXaiBridgeHealth, isXaiBridgeConfigured } from "@/lib/ai/xai-bridge";
import { checkGeminiBridgeHealth, isGeminiBridgeConfigured } from "@/lib/ai/gemini-bridge";
import { checkOpenAiBridgeHealth, isOpenAiBridgeConfigured } from "@/lib/ai/openai-bridge";

export async function GET() {
  const [xaiHealth, geminiHealth, openAiHealth] = await Promise.all([
    checkXaiBridgeHealth(),
    checkGeminiBridgeHealth(),
    checkOpenAiBridgeHealth(),
  ]);

  return NextResponse.json({
    aiProvider: xaiHealth.connected ? "xai" : geminiHealth.connected ? "gemini" : openAiHealth.connected ? "openai" : "none",
    aiConnected: xaiHealth.connected || geminiHealth.connected || openAiHealth.connected,
    xaiConfigured: isXaiBridgeConfigured(),
    xaiConnected: xaiHealth.connected,
    xaiStatusCode: xaiHealth.statusCode,
    xaiDetail: xaiHealth.detail,
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
