import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { defaultBusinessData, type BusinessData } from "@/lib/business/business-data";

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "business-data.json");

export async function getBusinessData(): Promise<BusinessData> {
  try {
    const raw = await readFile(dataFile, "utf8");
    const parsed = JSON.parse(raw) as Partial<BusinessData>;

    return normalizeBusinessData(parsed);
  } catch {
    return defaultBusinessData;
  }
}

export async function saveBusinessData(input: Partial<BusinessData>) {
  const existing = await getBusinessData();
  const next = normalizeBusinessData({
    ...existing,
    ...input,
    updatedAt: new Date().toISOString(),
  });

  await mkdir(dataDir, { recursive: true });
  await writeFile(dataFile, `${JSON.stringify(next, null, 2)}\n`, "utf8");

  return next;
}

function normalizeBusinessData(input: Partial<BusinessData>): BusinessData {
  return {
    revenue: numberOrZero(input.revenue),
    newBookings: numberOrZero(input.newBookings),
    missedCalls: numberOrZero(input.missedCalls),
    activeCleaners: numberOrZero(input.activeCleaners),
    upcomingJobs: numberOrZero(input.upcomingJobs),
    newLeads: numberOrZero(input.newLeads),
    openCustomerIssues: numberOrZero(input.openCustomerIssues),
    cleanerAvailability: input.cleanerAvailability?.trim() || defaultBusinessData.cleanerAvailability,
    completedTasks: listOrEmpty(input.completedTasks),
    approvalNeeded: listOrEmpty(input.approvalNeeded),
    opportunities: listOrEmpty(input.opportunities),
    updatedAt: input.updatedAt || defaultBusinessData.updatedAt,
  };
}

function numberOrZero(value: unknown) {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function listOrEmpty(value: unknown) {
  return Array.isArray(value) ? value.map(String).map((item) => item.trim()).filter(Boolean) : [];
}
