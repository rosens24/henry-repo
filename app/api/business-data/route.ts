import { NextResponse } from "next/server";
import { z } from "zod";
import { getBusinessData, saveBusinessData } from "@/lib/business/data-store";

const businessDataSchema = z.object({
  revenue: z.number().min(0),
  newBookings: z.number().int().min(0),
  missedCalls: z.number().int().min(0),
  activeCleaners: z.number().int().min(0),
  upcomingJobs: z.number().int().min(0),
  newLeads: z.number().int().min(0),
  openCustomerIssues: z.number().int().min(0),
  cleanerAvailability: z.string().trim().max(500),
  completedTasks: z.array(z.string().trim().min(1).max(160)).max(20),
  approvalNeeded: z.array(z.string().trim().min(1).max(160)).max(20),
  opportunities: z.array(z.string().trim().min(1).max(160)).max(20),
});

export async function GET() {
  return NextResponse.json(await getBusinessData());
}

export async function PUT(request: Request) {
  const body = await request.json();
  const parsed = businessDataSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid business data.", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  return NextResponse.json(await saveBusinessData(parsed.data));
}
