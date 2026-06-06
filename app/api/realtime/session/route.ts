import { NextResponse } from "next/server";
import { getDailyBriefings } from "@/lib/agent/briefing-generator";
import { autonomyPolicySummary } from "@/lib/agent/autonomy-policy";
import { getBotConnectorStatuses } from "@/lib/bots/connectors";
import { mockDashboardMetrics, mockOperationalSnapshot } from "@/lib/mock-data/dashboard";
import { checkRateLimit } from "@/lib/security/rate-limit";

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
      instructions: buildHenryInstructions(),
      audio: {
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

function buildHenryInstructions() {
  return [
    "You are Henry IV, the live voice operator for Cleanz.",
    "Speak like a calm, precise, cinematic executive AI operator.",
    "Do not interrupt the founder. Wait for the user to finish speaking before responding.",
    "Be concise. Lead with operational value.",
    "Use only the provided Cleanz snapshot unless the user provides more context.",
    "Label mock data as mock data.",
    "Never claim real Stripe, Twilio, Gmail, Supabase, GitHub, Vercel, Cloudflare, or booking data is connected unless explicitly provided.",
    "Never execute payments, refunds, pricing changes, customer messages, cleaner messages, booking changes, deploys, GitHub pushes, data deletion, passwords, or API-key handling without explicit scoped approval.",
    JSON.stringify({
      dataLabel: "mock data unless otherwise stated",
      dashboardMetrics: mockDashboardMetrics,
      operationalSnapshot: mockOperationalSnapshot,
      briefings: getDailyBriefings(),
      botConnectors: getBotConnectorStatuses(),
      autonomyPolicy: autonomyPolicySummary(),
    }),
  ].join("\n");
}
