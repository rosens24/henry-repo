import { NextResponse } from "next/server";
import { z } from "zod";
import { queueXenomorphHandoff } from "@/lib/agent/xenomorph-handoff";
import { checkRateLimit } from "@/lib/security/rate-limit";

const handoffSchema = z.object({
  prompt: z.string().trim().min(1).max(1500),
});

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(`xenomorph:${request.headers.get("x-forwarded-for") ?? "local"}`, 12, 60_000);

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "XENOMORPH handoff rate limit exceeded." }, { status: 429 });
  }

  const parsed = handoffSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Prompt is required.", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const handoff = queueXenomorphHandoff(parsed.data.prompt);

  return NextResponse.json({
    handoff,
    message: "Prompt queued for XENOMORPH in local handoff mode. No code was changed or pushed.",
  });
}
