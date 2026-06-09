import { hasLiveIntegration } from "@/lib/integrations/live-config";
import { buildOperatorInstructions, buildOperatorPayload } from "@/lib/ai/operator-context";
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

type OpenAiErrorShape = {
  error?: {
    message?: string;
    type?: string;
    code?: string | null;
  };
};

export function isOpenAiBridgeConfigured() {
  return hasLiveIntegration("openai");
}

export async function checkOpenAiBridgeHealth() {
  if (!isOpenAiBridgeConfigured()) {
    return {
      configured: false,
      authenticated: false,
      connected: false,
      statusCode: 0,
      detail: "OPENAI_API_KEY is not configured.",
    };
  }

  try {
    const authResponse = await fetch("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      cache: "no-store",
    });

    if (!authResponse.ok) {
      return {
        configured: true,
        authenticated: false,
        connected: false,
        statusCode: authResponse.status,
        detail: `OpenAI API key rejected with status ${authResponse.status}.`,
      };
    }

    const probeResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5",
        input: "Health check. Reply ok.",
        max_output_tokens: 16,
      }),
      cache: "no-store",
    });

    if (!probeResponse.ok) {
      const errorDetail = await readOpenAiError(probeResponse);

      return {
        configured: true,
        authenticated: true,
        connected: false,
        statusCode: probeResponse.status,
        detail: errorDetail,
      };
    }

    return {
      configured: true,
      authenticated: true,
      connected: true,
      statusCode: probeResponse.status,
      detail: "OpenAI API key accepted and response generation is available.",
    };
  } catch {
    return {
      configured: true,
      authenticated: false,
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

  const [instructions, payload] = await Promise.all([
    buildOperatorInstructions(),
    buildOperatorPayload(command, agent),
  ]);

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-5",
      instructions,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify(payload),
            },
          ],
        },
      ],
      max_output_tokens: 220,
    }),
  });

  if (!response.ok) {
    const errorDetail = await readOpenAiError(response);

    return {
      connected: false,
      content: errorDetail,
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

async function readOpenAiError(response: Response) {
  const raw = await response.text().catch(() => "");

  try {
    const parsed = JSON.parse(raw) as OpenAiErrorShape;
    const error = parsed.error;
    const code = error?.code ? ` code ${error.code}` : "";
    const type = error?.type ? ` type ${error.type}` : "";
    const message = error?.message || raw || "No OpenAI error body returned.";

    return `OpenAI request failed with status ${response.status}${type}${code}: ${message}`;
  } catch {
    return `OpenAI request failed with status ${response.status}: ${raw || "No OpenAI error body returned."}`;
  }
}
