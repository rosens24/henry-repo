import { NextResponse } from "next/server";
import { getBotConnectorStatuses } from "@/lib/bots/connectors";
import { checkOpenAiBridgeHealth, isOpenAiBridgeConfigured } from "@/lib/ai/openai-bridge";

export async function GET() {
  const openAiHealth = await checkOpenAiBridgeHealth();

  return NextResponse.json({
    openAiConfigured: isOpenAiBridgeConfigured(),
    openAiConnected: openAiHealth.connected,
    openAiStatusCode: openAiHealth.statusCode,
    openAiDetail: openAiHealth.detail,
    connectors: getBotConnectorStatuses(),
    generatedAt: new Date().toISOString(),
  });
}
