import { NextResponse } from "next/server";
import { z } from "zod";
import { runJarvisCommand } from "@/lib/ai/jarvis-engine";
import { checkRateLimit } from "@/lib/security/rate-limit";

const requestSchema = z.object({
  command: z.string().trim().min(1).max(500),
  source: z.enum(["typed", "voice"]).default("typed"),
  actorRole: z.enum(["owner", "admin", "cleaner", "customer"]).default("owner"),
  readOnlyMode: z.boolean().default(true),
});

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(getClientKey(request));

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Slow down command traffic and retry shortly." },
      { status: 429, headers: { "Retry-After": Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString() } },
    );
  }

  const body = await request.json();
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid Henry IV request.", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const result = await runJarvisCommand(parsed.data);

  return NextResponse.json(result);
}

function getClientKey(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local-jarvis-client";
}
