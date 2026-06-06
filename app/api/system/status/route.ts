import { NextResponse } from "next/server";
import { getBotConnectorStatuses } from "@/lib/bots/connectors";
import { isOpenAiBridgeConfigured } from "@/lib/ai/openai-bridge";

export async function GET() {
  return NextResponse.json({
    openAiConnected: isOpenAiBridgeConfigured(),
    connectors: getBotConnectorStatuses(),
    generatedAt: new Date().toISOString(),
  });
}
