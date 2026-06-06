import type { JarvisMessage } from "@/lib/ai/types";

export type ActivityItem = {
  id: string;
  title: string;
  detail: string;
  time: string;
};

export type AlertItem = {
  id: string;
  title: string;
  detail: string;
  severity: "low" | "medium" | "high";
};

export const initialMessages: JarvisMessage[] = [
  {
    id: "henry-boot",
    role: "assistant",
    content:
      "Henry IV command layer initialized. Enter your business data, then I can summarize today, inspect bookings, and stage approval-gated actions.",
    createdAt: new Date().toISOString(),
    source: "system",
  },
];

export const mockActivityFeed: ActivityItem[] = [];

export const mockAlerts: AlertItem[] = [];
