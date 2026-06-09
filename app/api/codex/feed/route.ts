import { NextResponse } from "next/server";
import { z } from "zod";
import { appendHenryFeedEntry, formatHenryFeedForCodex, getHenryFeedEntries } from "@/lib/ai/conversation-store";
import { checkRateLimit } from "@/lib/security/rate-limit";

const postSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().trim().min(1).max(4000),
  source: z.enum(["typed", "voice", "system"]).default("voice"),
  channel: z.enum(["chat", "realtime_voice", "browser_voice", "system"]).default("realtime_voice"),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") || 40);
  const entries = await getHenryFeedEntries(limit);

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    entries,
    codexPrompt: [
      "Henry IV conversation feed for Codex:",
      formatHenryFeedForCodex(entries),
      "",
      "Use this as owner-approved working context. Do not treat it as permission to execute destructive actions.",
    ].join("\n"),
  });
}

export async function POST(request: Request) {
  const rateLimit = checkRateLimit("codex-feed", 60, 60_000);

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Henry IV feed rate limit exceeded." }, { status: 429 });
  }

  const body = await request.json();
  const parsed = postSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid Henry IV feed entry.", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const entry = await appendHenryFeedEntry(parsed.data);

  return NextResponse.json({ entry });
}
