import { NextResponse } from "next/server";
import { autonomyPolicySummary } from "@/lib/agent/autonomy-policy";
import { getBotConnectorStatuses } from "@/lib/bots/connectors";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { buildDailyBriefings, buildDashboardMetrics } from "@/lib/business/business-data";
import { getBusinessData } from "@/lib/business/data-store";
import { formatHenryIvProfileForPrompt } from "@/lib/profile/henry-profile";

export async function POST(request: Request) {
  const rateLimit = checkRateLimit("realtime-session", 10, 60_000);

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Realtime session rate limit exceeded." }, { status: 429 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      {
        error: "OpenAI Realtime is not connected. Waiting only on OPENAI_API_KEY.",
      },
      { status: 503 },
    );
  }

  const sdp = await request.text();

  if (!sdp.trim()) {
    return NextResponse.json({ error: "Missing WebRTC SDP offer." }, { status: 400 });
  }

  const formData = new FormData();
  formData.set("sdp", sdp);
  formData.set(
    "session",
    JSON.stringify({
      type: "realtime",
      model: process.env.OPENAI_REALTIME_MODEL || "gpt-realtime-2",
      instructions: await buildHenryInstructions(),
      audio: {
        input: {
          transcription: {
            model: process.env.OPENAI_TRANSCRIPTION_MODEL || "gpt-4o-mini-transcribe",
          },
          turn_detection: {
            type: "server_vad",
            silence_duration_ms: 900,
          },
        },
        output: {
          voice: process.env.OPENAI_REALTIME_VOICE || "cedar",
        },
      },
    }),
  );

  const response = await fetch("https://api.openai.com/v1/realtime/calls", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "OpenAI-Safety-Identifier": "cleanz-founder-local",
    },
    body: formData,
  });

  const responseText = await response.text();

  if (!response.ok) {
    return NextResponse.json(
      {
        error: "OpenAI Realtime session failed.",
        detail: responseText,
      },
      { status: response.status },
    );
  }

  return new Response(responseText, {
    headers: {
      "Content-Type": "application/sdp",
      "Cache-Control": "no-store",
    },
  });
}

async function buildHenryInstructions() {
  const businessData = await getBusinessData();

  return [
    "You are Henry IV, the live voice operator for Cleanz and Cedar Neck Realty.",
    "Speak like a capable frontier AI assistant with the cedar voice: clean, direct, quick, and useful.",
    "Style target: closer to Grok than a corporate chatbot. Be witty only when it helps. Never ramble.",
    "The owner should be able to talk to you like ChatGPT, Claude, or Grok. Answer naturally, remember the operating context, and convert vague intent into next steps.",
    "Do not interrupt the founder. Wait for the user to finish speaking before responding.",
    "Be concise. Lead with operational value.",
    "Use 'kind sir' sparingly as a signature, not every sentence.",
    "Use only the provided Henry IV profile and system snapshot unless the user provides more context.",
    formatHenryIvProfileForPrompt(),
    "Treat entered business data as real local owner-entered data.",
    "Never claim real Stripe, Twilio, Gmail, Supabase, GitHub, Vercel, Cloudflare, or booking data is connected unless explicitly provided.",
    "Never execute payments, refunds, pricing changes, customer messages, cleaner messages, booking changes, deploys, GitHub pushes, data deletion, passwords, or API-key handling without explicit scoped approval.",
    JSON.stringify({
      dataLabel: "owner-entered local business data",
      dashboardMetrics: buildDashboardMetrics(businessData),
      operationalSnapshot: businessData,
      briefings: buildDailyBriefings(businessData),
      botConnectors: getBotConnectorStatuses(),
      autonomyPolicy: autonomyPolicySummary(),
    }),
  ].join("\n");
}
