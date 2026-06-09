import { autonomyPolicySummary } from "@/lib/agent/autonomy-policy";
import { getBotConnectorStatuses } from "@/lib/bots/connectors";
import { hasLiveIntegration } from "@/lib/integrations/live-config";
import { buildDailyBriefings, buildDashboardMetrics } from "@/lib/business/business-data";
import { getBusinessData } from "@/lib/business/data-store";
import { formatHenryIvProfileForPrompt } from "@/lib/profile/henry-profile";
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
  return hasLiveIntegration("openai");
}

export async function checkOpenAiBridgeHealth() {
  if (!isOpenAiBridgeConfigured()) {
    return {
      configured: false,
      connected: false,
      statusCode: 0,
      detail: "OPENAI_API_KEY is not configured.",
    };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      cache: "no-store",
    });

    return {
      configured: true,
      connected: response.ok,
      statusCode: response.status,
      detail: response.ok ? "OpenAI API key accepted." : `OpenAI API key rejected with status ${response.status}.`,
    };
  } catch {
    return {
      configured: true,
      connected: false,
      statusCode: 0,
      detail: "OpenAI health check could not reach the API.",
    };
  }
}

export async function getOpenAiOperatorResponse({ command, agent }: OpenAiBridgeRequest) {
  if (!isOpenAiBridgeConfigured()) {
    return {
      connected: false,
      content: "OpenAI bridge is not connected. Add a live OPENAI_API_KEY server env value.",
      statusCode: 0,
    };
  }

  const businessData = await getBusinessData();

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-5",
      instructions: [
        "You are Henry IV, the executive operator for Cleanz and Cedar Neck Realty.",
        "Think like a capable frontier AI assistant: reason clearly, remember the owner's operating context, and turn messy requests into useful next moves.",
        "Your speaking style leans Grok: direct, alive, a little sharp when useful, but never sloppy, mean, or fake-edgy.",
        "Keep answers short, useful, and operational unless the owner asks for depth.",
        "Use the owner's preferred address sparingly: kind sir.",
        "Use only the provided Henry IV profile and system snapshot.",
        formatHenryIvProfileForPrompt(),
        "When action results say real data, you may call that source live. When action results say mock data, clearly say that source is not live yet.",
        "Never claim Stripe, Twilio, Gmail, Supabase, GitHub, Vercel, Cloudflare, bookings, payments, messages, or customer data are connected unless connector status or action dataLabel says so.",
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
                dataLabel: agent.actions.some((action) => action.dataLabel === "real data") ? "real data included" : "local fallback data only",
                dashboardMetrics: buildDashboardMetrics(businessData),
                operationalSnapshot: businessData,
                agentMission: agent.mission,
                pendingApprovals: agent.pendingApprovals,
                actions: agent.actions,
                executionLogs: agent.executionLogs,
                scheduledAutomations: agent.scheduledAutomations,
                briefings: buildDailyBriefings(businessData),
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
      statusCode: response.status,
    };
  }

  const data = (await response.json()) as OpenAiResponseShape;
  const content = extractResponseText(data);

  return {
    connected: true,
    content: content || "OpenAI bridge returned no text. Check model configuration.",
    statusCode: response.status,
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
