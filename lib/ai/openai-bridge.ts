import { getDailyBriefings } from "@/lib/agent/briefing-generator";
import { autonomyPolicySummary } from "@/lib/agent/autonomy-policy";
import { getBotConnectorStatuses } from "@/lib/bots/connectors";
import { mockDashboardMetrics, mockOperationalSnapshot } from "@/lib/mock-data/dashboard";
import type { AgentRunResult } from "@/lib/agent/types";

type OpenAiBridgeRequest = {
  command: string;
  agent: AgentRunResult;
};

type OpenAiResponseShape = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      text?: string;
      type?: string;
    }>;
  }>;
};

export function isOpenAiBridgeConfigured() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export async function getOpenAiOperatorResponse({ command, agent }: OpenAiBridgeRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return {
      connected: false,
      content: "OpenAI bridge is not connected. Missing server env: OPENAI_API_KEY.",
    };
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-5",
      instructions: [
        "You are Henry IV, the executive operator for Cleanz. Your style is calm, precise, and polished like a cinematic AI assistant.",
        "Be short, direct, and operational.",
        "Use only the provided Cleanz dashboard snapshot.",
        "If data is mock data, label it as mock data.",
        "Never claim real Stripe, Twilio, Gmail, Supabase, GitHub, Vercel, Cloudflare, or booking data is connected unless the snapshot says it is.",
        "Never authorize money movement, customer messages, cleaner messages, emails, pricing changes, booking changes, deletes, password/API-key handling, or GitHub pushes without explicit approval.",
        "If the user asks for Codex/XENOMORPH, stage a developer handoff. Do not claim you executed code.",
      ].join("\n"),
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify({
                command,
                dataLabel: "mock data unless otherwise stated",
                dashboardMetrics: mockDashboardMetrics,
                operationalSnapshot: mockOperationalSnapshot,
                agentMission: agent.mission,
                pendingApprovals: agent.pendingApprovals,
                actions: agent.actions,
                executionLogs: agent.executionLogs,
                scheduledAutomations: agent.scheduledAutomations,
                briefings: getDailyBriefings(),
                botConnectors: getBotConnectorStatuses(),
                autonomyPolicy: autonomyPolicySummary(),
              }),
            },
          ],
        },
      ],
      max_output_tokens: 220,
    }),
  });

  if (!response.ok) {
    return {
      connected: false,
      content: `OpenAI bridge request failed with status ${response.status}. Check OPENAI_API_KEY and OPENAI_MODEL.`,
    };
  }

  const data = (await response.json()) as OpenAiResponseShape;
  const content = extractResponseText(data);

  return {
    connected: true,
    content: content || "OpenAI bridge returned no text. Check model configuration.",
  };
}

function extractResponseText(data: OpenAiResponseShape) {
  if (data.output_text) return data.output_text;

  return data.output
    ?.flatMap((item) => item.content ?? [])
    .map((content) => content.text)
    .filter(Boolean)
    .join("\n")
    .trim();
}
