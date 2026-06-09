import { NextResponse } from "next/server";
import { z } from "zod";
import { getBusinessData, saveBusinessData } from "@/lib/business/data-store";

const cleanzCrmSchema = z.object({
  id: z.string().trim().min(1).max(80),
  companyName: z.string().trim().max(120),
  contactName: z.string().trim().max(120),
  phone: z.string().trim().max(60),
  email: z.string().trim().max(120),
  website: z.string().trim().max(160),
  status: z.enum(["to_call", "called", "follow_up", "proposal", "won", "lost"]),
  notes: z.string().trim().max(1000),
  nextStep: z.string().trim().max(300),
  createdAt: z.string().trim().max(80),
  updatedAt: z.string().trim().max(80),
});

const cedarNeckDealSchema = z.object({
  id: z.string().trim().min(1).max(80),
  propertyName: z.string().trim().max(140),
  address: z.string().trim().max(180),
  dealType: z.enum(["single_family", "multifamily"]),
  source: z.string().trim().max(120),
  status: z.enum(["new", "researching", "contacted", "underwriting", "offer_ready", "submitted", "dead"]),
  askingPrice: z.number().min(0),
  units: z.number().int().min(0),
  notes: z.string().trim().max(1200),
  nextStep: z.string().trim().max(300),
  createdAt: z.string().trim().max(80),
  updatedAt: z.string().trim().max(80),
});

const healthOsSchema = z.object({
  food: z.array(z.string().trim().min(1).max(180)).max(20),
  mind: z.array(z.string().trim().min(1).max(180)).max(20),
  body: z.array(z.string().trim().min(1).max(180)).max(20),
  exercise: z.array(z.string().trim().min(1).max(180)).max(20),
  dailyChecklist: z.array(z.string().trim().min(1).max(120)).max(20),
  weeklyReview: z.string().trim().max(1000),
});

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
  cleanzCrm: z.array(cleanzCrmSchema).max(500),
  cedarNeckDeals: z.array(cedarNeckDealSchema).max(500),
  healthOs: healthOsSchema,
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
