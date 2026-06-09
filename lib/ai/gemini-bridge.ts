import { hasLiveIntegration } from "@/lib/integrations/live-config";
import { buildOperatorInstructions, buildOperatorPayload } from "@/lib/ai/operator-context";
import type { AgentRunResult } from "@/lib/agent/types";

type GeminiBridgeRequest = {
  command: string;
  agent: AgentRunResult;
};

type GeminiResponseShape = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
};

type GeminiErrorShape = {
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
};

export function isGeminiBridgeConfigured() {
  return hasLiveIntegration("gemini");
}

export async function checkGeminiBridgeHealth() {
  if (!isGeminiBridgeConfigured()) {
    return {
      configured: false,
      connected: false,
      statusCode: 0,
      detail: "GEMINI_API_KEY is not configured.",
    };
  }

  try {
    const response = await fetch(buildGeminiUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: "Health check. Reply ok." }] }],
        generationConfig: { maxOutputTokens: 16 },
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        configured: true,
        connected: false,
        statusCode: response.status,
        detail: await readGeminiError(response),
      };
    }

    return {
      configured: true,
      connected: true,
      statusCode: response.status,
      detail: "Gemini API key accepted and response generation is available.",
    };
  } catch {
    return {
      configured: true,
      connected: false,
      statusCode: 0,
      detail: "Gemini health check could not reach the API.",
    };
  }
}

export async function getGeminiOperatorResponse({ command, agent }: GeminiBridgeRequest) {
  if (!isGeminiBridgeConfigured()) {
    return {
      provider: "gemini" as const,
      connected: false,
      content: "Gemini bridge is not connected. Add GEMINI_API_KEY to Railway.",
      statusCode: 0,
    };
  }

  const [instructions, payload] = await Promise.all([
    buildOperatorInstructions(),
    buildOperatorPayload(command, agent),
  ]);

  const response = await fetch(buildGeminiUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: instructions }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: JSON.stringify(payload) }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 260,
        temperature: 0.7,
      },
    }),
  });

  if (!response.ok) {
    return {
      provider: "gemini" as const,
      connected: false,
      content: await readGeminiError(response),
      statusCode: response.status,
    };
  }

  const data = (await response.json()) as GeminiResponseShape;

  return {
    provider: "gemini" as const,
    connected: true,
    content: extractGeminiText(data) || "Gemini returned no text. Check GEMINI_MODEL.",
    statusCode: response.status,
  };
}

function buildGeminiUrl() {
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const key = process.env.GEMINI_API_KEY;

  return `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key || "")}`;
}

function extractGeminiText(data: GeminiResponseShape) {
  return data.candidates
    ?.flatMap((candidate) => candidate.content?.parts ?? [])
    .map((part) => part.text)
    .filter(Boolean)
    .join("\n")
    .trim();
}

async function readGeminiError(response: Response) {
  const raw = await response.text().catch(() => "");

  try {
    const parsed = JSON.parse(raw) as GeminiErrorShape;
    const error = parsed.error;
    const status = error?.status ? ` ${error.status}` : "";
    const message = error?.message || raw || "No Gemini error body returned.";

    return `Gemini request failed with status ${response.status}${status}: ${message}`;
  } catch {
    return `Gemini request failed with status ${response.status}: ${raw || "No Gemini error body returned."}`;
  }
}
