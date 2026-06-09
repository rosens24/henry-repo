import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { Pool } from "pg";
import type { CommandSource, MessageRole } from "@/lib/ai/types";

export type HenryFeedChannel = "chat" | "realtime_voice" | "browser_voice" | "system";

export type HenryFeedEntry = {
  id: string;
  role: MessageRole | "system";
  content: string;
  source: CommandSource;
  channel: HenryFeedChannel;
  createdAt: string;
  metadata?: Record<string, unknown>;
};

const dataDir = path.join(process.cwd(), "data");
const feedFile = path.join(dataDir, "henry-conversation-feed.json");
const maxStoredEntries = 300;

let pool: Pool | undefined;
let tableReady: Promise<void> | undefined;

export async function appendHenryFeedEntry(input: Omit<HenryFeedEntry, "id" | "createdAt"> & Partial<Pick<HenryFeedEntry, "id" | "createdAt">>) {
  const entry: HenryFeedEntry = {
    id: input.id || crypto.randomUUID(),
    role: input.role,
    content: input.content.trim(),
    source: input.source,
    channel: input.channel,
    createdAt: input.createdAt || new Date().toISOString(),
    metadata: input.metadata,
  };

  if (!entry.content) return entry;

  if (process.env.DATABASE_URL) {
    await appendHenryFeedEntryToPostgres(entry);
    return entry;
  }

  const current = await getHenryFeedEntries(maxStoredEntries);
  const next = [entry, ...current].slice(0, maxStoredEntries);
  await mkdir(dataDir, { recursive: true });
  await writeFile(feedFile, `${JSON.stringify(next, null, 2)}\n`, "utf8");

  return entry;
}

export async function appendHenryFeedTurn({
  user,
  assistant,
  source,
  channel,
  metadata,
}: {
  user: string;
  assistant: string;
  source: CommandSource;
  channel: HenryFeedChannel;
  metadata?: Record<string, unknown>;
}) {
  await appendHenryFeedEntry({ role: "user", content: user, source, channel, metadata });
  await appendHenryFeedEntry({ role: "assistant", content: assistant, source: "system", channel, metadata });
}

export async function getHenryFeedEntries(limit = 40): Promise<HenryFeedEntry[]> {
  const safeLimit = Math.max(1, Math.min(limit, maxStoredEntries));

  if (process.env.DATABASE_URL) {
    return getHenryFeedEntriesFromPostgres(safeLimit);
  }

  try {
    const raw = await readFile(feedFile, "utf8");
    const parsed = JSON.parse(raw) as HenryFeedEntry[];

    return normalizeEntries(parsed).slice(0, safeLimit);
  } catch {
    return [];
  }
}

export function formatHenryFeedForCodex(entries: HenryFeedEntry[]) {
  if (!entries.length) {
    return "No Henry IV conversation feed entries have been stored yet.";
  }

  return entries
    .slice()
    .reverse()
    .map((entry) => {
      const label = entry.role === "assistant" ? "Henry IV" : entry.role === "user" ? "Owner" : "System";
      return `[${entry.createdAt}] ${label} via ${entry.channel}: ${entry.content}`;
    })
    .join("\n");
}

async function appendHenryFeedEntryToPostgres(entry: HenryFeedEntry) {
  await ensureHenryFeedTable();

  await getPool().query(
    `
      insert into henry_conversation_feed (id, role, content, source, channel, metadata, created_at)
      values ($1, $2, $3, $4, $5, $6::jsonb, $7)
      on conflict (id) do nothing
    `,
    [entry.id, entry.role, entry.content, entry.source, entry.channel, JSON.stringify(entry.metadata ?? {}), entry.createdAt],
  );
}

async function getHenryFeedEntriesFromPostgres(limit: number) {
  await ensureHenryFeedTable();

  const result = await getPool().query<{
    id: string;
    role: HenryFeedEntry["role"];
    content: string;
    source: CommandSource;
    channel: HenryFeedChannel;
    metadata: Record<string, unknown>;
    created_at: Date;
  }>(
    `
      select id, role, content, source, channel, metadata, created_at
      from henry_conversation_feed
      order by created_at desc
      limit $1
    `,
    [limit],
  );

  return result.rows.map((row) => ({
    id: row.id,
    role: row.role,
    content: row.content,
    source: row.source,
    channel: row.channel,
    createdAt: row.created_at.toISOString(),
    metadata: row.metadata,
  }));
}

async function ensureHenryFeedTable() {
  tableReady ??= getPool()
    .query(`
      create table if not exists henry_conversation_feed (
        id text primary key,
        role text not null,
        content text not null,
        source text not null,
        channel text not null,
        metadata jsonb not null default '{}'::jsonb,
        created_at timestamptz not null default now()
      )
    `)
    .then(() => undefined);

  return tableReady;
}

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for Postgres Henry IV conversation storage.");
  }

  pool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes("railway.internal") ? false : { rejectUnauthorized: false },
  });

  return pool;
}

function normalizeEntries(entries: HenryFeedEntry[]) {
  if (!Array.isArray(entries)) return [];

  return entries
    .filter((entry) => entry && typeof entry.content === "string")
    .map((entry) => ({
      id: entry.id || crypto.randomUUID(),
      role: entry.role,
      content: entry.content,
      source: entry.source || "system",
      channel: entry.channel || "system",
      createdAt: entry.createdAt || new Date().toISOString(),
      metadata: entry.metadata,
    }));
}
