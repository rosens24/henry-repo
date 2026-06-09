import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { Pool } from "pg";
import { defaultBusinessData, defaultHealthOs, type BusinessData, type CedarNeckDealRecord, type CleanzCompanyRecord, type HealthOperatingSystem } from "@/lib/business/business-data";

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "business-data.json");
const postgresDocumentId = "business-data";

let pool: Pool | undefined;
let tableReady: Promise<void> | undefined;

export async function getBusinessData(): Promise<BusinessData> {
  if (process.env.DATABASE_URL) {
    return getBusinessDataFromPostgres();
  }

  try {
    const raw = await readFile(dataFile, "utf8");
    const parsed = JSON.parse(raw) as Partial<BusinessData>;

    return normalizeBusinessData(parsed);
  } catch {
    return defaultBusinessData;
  }
}

export async function saveBusinessData(input: Partial<BusinessData>) {
  if (process.env.DATABASE_URL) {
    return saveBusinessDataToPostgres(input);
  }

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

async function getBusinessDataFromPostgres() {
  await ensureBusinessDataTable();

  const result = await getPool().query<{ payload: Partial<BusinessData> }>(
    "select payload from business_data_documents where id = $1",
    [postgresDocumentId],
  );

  return normalizeBusinessData(result.rows[0]?.payload ?? defaultBusinessData);
}

async function saveBusinessDataToPostgres(input: Partial<BusinessData>) {
  await ensureBusinessDataTable();

  const existing = await getBusinessDataFromPostgres();
  const next = normalizeBusinessData({
    ...existing,
    ...input,
    updatedAt: new Date().toISOString(),
  });

  await getPool().query(
    `
      insert into business_data_documents (id, payload, updated_at)
      values ($1, $2::jsonb, now())
      on conflict (id)
      do update set payload = excluded.payload, updated_at = now()
    `,
    [postgresDocumentId, JSON.stringify(next)],
  );

  return next;
}

async function ensureBusinessDataTable() {
  tableReady ??= getPool().query(`
    create table if not exists business_data_documents (
      id text primary key,
      payload jsonb not null,
      updated_at timestamptz not null default now()
    )
  `).then(() => undefined);

  return tableReady;
}

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for Postgres business data storage.");
  }

  pool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes("railway.internal") ? false : { rejectUnauthorized: false },
  });

  return pool;
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
    cleanzCrm: normalizeCleanzCrm(input.cleanzCrm),
    cedarNeckDeals: normalizeCedarNeckDeals(input.cedarNeckDeals),
    healthOs: normalizeHealthOs(input.healthOs),
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

function normalizeCleanzCrm(value: unknown): CleanzCompanyRecord[] {
  if (!Array.isArray(value)) return [];

  return value.map((item): CleanzCompanyRecord => {
    const record = item as Partial<CleanzCompanyRecord>;
    const timestamp = stringOrEmpty(record.updatedAt) || new Date().toISOString();

    return {
      id: stringOrEmpty(record.id) || crypto.randomUUID(),
      companyName: stringOrEmpty(record.companyName),
      contactName: stringOrEmpty(record.contactName),
      phone: stringOrEmpty(record.phone),
      email: stringOrEmpty(record.email),
      website: stringOrEmpty(record.website),
      status: cleanzStatus(record.status),
      notes: stringOrEmpty(record.notes),
      nextStep: stringOrEmpty(record.nextStep),
      createdAt: stringOrEmpty(record.createdAt) || timestamp,
      updatedAt: timestamp,
    };
  }).filter((record) => record.companyName || record.phone || record.notes);
}

function normalizeCedarNeckDeals(value: unknown): CedarNeckDealRecord[] {
  if (!Array.isArray(value)) return [];

  return value.map((item): CedarNeckDealRecord => {
    const record = item as Partial<CedarNeckDealRecord>;
    const timestamp = stringOrEmpty(record.updatedAt) || new Date().toISOString();

    return {
      id: stringOrEmpty(record.id) || crypto.randomUUID(),
      propertyName: stringOrEmpty(record.propertyName),
      address: stringOrEmpty(record.address),
      dealType: record.dealType === "multifamily" ? "multifamily" : "single_family",
      source: stringOrEmpty(record.source),
      status: dealStatus(record.status),
      askingPrice: numberOrZero(record.askingPrice),
      units: numberOrZero(record.units),
      notes: stringOrEmpty(record.notes),
      nextStep: stringOrEmpty(record.nextStep),
      createdAt: stringOrEmpty(record.createdAt) || timestamp,
      updatedAt: timestamp,
    };
  }).filter((record) => record.propertyName || record.address || record.notes);
}

function normalizeHealthOs(value: unknown): HealthOperatingSystem {
  const input = typeof value === "object" && value ? value as Partial<HealthOperatingSystem> : {};

  return {
    food: listOrDefault(input.food, defaultHealthOs.food),
    mind: listOrDefault(input.mind, defaultHealthOs.mind),
    body: listOrDefault(input.body, defaultHealthOs.body),
    exercise: listOrDefault(input.exercise, defaultHealthOs.exercise),
    dailyChecklist: listOrDefault(input.dailyChecklist, defaultHealthOs.dailyChecklist),
    weeklyReview: stringOrEmpty(input.weeklyReview) || defaultHealthOs.weeklyReview,
  };
}

function listOrDefault(value: unknown, fallback: string[]) {
  const list = listOrEmpty(value);

  return list.length ? list : fallback;
}

function stringOrEmpty(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanzStatus(value: unknown): CleanzCompanyRecord["status"] {
  return ["to_call", "called", "follow_up", "proposal", "won", "lost"].includes(String(value)) ? value as CleanzCompanyRecord["status"] : "to_call";
}

function dealStatus(value: unknown): CedarNeckDealRecord["status"] {
  return ["new", "researching", "contacted", "underwriting", "offer_ready", "submitted", "dead"].includes(String(value)) ? value as CedarNeckDealRecord["status"] : "new";
}
