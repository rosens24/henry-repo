import { hasLiveIntegration } from "@/lib/integrations/live-config";
import { buildOperatorInstructions, buildOperatorPayload } from "@/lib/ai/operator-context";
import type { AgentRunResult } from "@/lib/agent/types";

type XaiBridgeRequest = {
  command: string;
  agent: AgentRunResult;
};

type XaiResponseShape = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      text?: string;
      type?: string;
    }>;
  }>;
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

type XaiErrorShape = {
  error?: {
    message?: string;
    type?: string;
    code?: string | null;
  };
};

export function isXaiBridgeConfigured() {
  return hasLiveIntegration("xai");
}

export async function checkXaiBridgeHealth() {
  if (!isXaiBridgeConfigured()) {
    return {
      configured: false,
      connected: false,
      statusCode: 0,
      detail: "XAI_API_KEY is not configured.",
    };
  }

  try {
    const response = await fetch("https://api.x.ai/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.XAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.XAI_MODEL || "grok-4.3",
        input: "Health check. Reply ok.",
        max_output_tokens: 16,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        configured: true,
        connected: false,
        statusCode: response.status,
        detail: await readXaiError(response),
      };
    }

    return {
      configured: true,
      connected: true,
      statusCode: response.status,
      detail: "xAI Grok API key accepted and response generation is available.",
    };
  } catch {
    return {
      configured: true,
      connected: false,
      statusCode: 0,
      detail: "xAI health check could not reach the API.",
    };
  }
}

export async function getXaiOperatorResponse({ command, agent }: XaiBridgeRequest) {
  if (!isXaiBridgeConfigured()) {
    return {
      provider: "xai" as const,
      connected: false,
      content: "Grok bridge is not connected. Add XAI_API_KEY to Railway.",
      statusCode: 0,
    };
  }

  const [instructions, payload] = await Promise.all([
    buildOperatorInstructions(),
    buildOperatorPayload(command, agent),
  ]);

  const response = await fetch("https://api.x.ai/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.XAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.XAI_MODEL || "grok-4.3",
      input: [
        { role: "system", content: instructions },
        { role: "user", content: JSON.stringify(payload) },
      ],
      max_output_tokens: 260,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    return {
      provider: "xai" as const,
      connected: false,
      content: await readXaiError(response),
      statusCode: response.status,
    };
  }

  const data = (await response.json()) as XaiResponseShape;

  return {
    provider: "xai" as const,
    connected: true,
    content: extractXaiText(data) || "Grok returned no text. Check XAI_MODEL.",
    statusCode: response.status,
  };
}

function extractXaiText(data: XaiResponseShape) {
  if (data.output_text) return data.output_text;

  const responseText = data.output
    ?.flatMap((item) => item.content ?? [])
    .map((content) => content.text)
    .filter(Boolean)
    .join("\n")
    .trim();

  if (responseText) return responseText;

  return data.choices?.map((choice) => choice.message?.content).filter(Boolean).join("\n").trim();
}

async function readXaiError(response: Response) {
  const raw = await response.text().catch(() => "");

  try {
    const parsed = JSON.parse(raw) as XaiErrorShape;
    const error = parsed.error;
    const code = error?.code ? ` code ${error.code}` : "";
    const type = error?.type ? ` type ${error.type}` : "";
    const message = error?.message || raw || "No xAI error body returned.";

    return `xAI request failed with status ${response.status}${type}${code}: ${message}`;
  } catch {
    return `xAI request failed with status ${response.status}: ${raw || "No xAI error body returned."}`;
  }
}
