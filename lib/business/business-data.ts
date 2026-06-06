import type { Briefing } from "@/lib/agent/types";
import type { DashboardMetric } from "@/lib/ai/types";

export type BusinessData = {
  revenue: number;
  newBookings: number;
  missedCalls: number;
  activeCleaners: number;
  upcomingJobs: number;
  newLeads: number;
  openCustomerIssues: number;
  cleanerAvailability: string;
  completedTasks: string[];
  approvalNeeded: string[];
  opportunities: string[];
  updatedAt: string;
};

export const defaultBusinessData: BusinessData = {
  revenue: 0,
  newBookings: 0,
  missedCalls: 0,
  activeCleaners: 0,
  upcomingJobs: 0,
  newLeads: 0,
  openCustomerIssues: 0,
  cleanerAvailability: "No cleaner availability entered yet.",
  completedTasks: [],
  approvalNeeded: [],
  opportunities: [],
  updatedAt: new Date(0).toISOString(),
};

export function formatRevenue(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
}

export function buildDashboardMetrics(data: BusinessData): DashboardMetric[] {
  return [
    {
      id: "bookings",
      label: "New Bookings",
      value: `${data.newBookings}`,
      detail: "Booking requests entered into Henry IV.",
      trend: data.newBookings > 0 ? "up" : "flat",
      intensity: clampIntensity(data.newBookings * 5),
    },
    {
      id: "cleaners",
      label: "Active Cleaners",
      value: `${data.activeCleaners}`,
      detail: "Cleaner capacity entered for dispatch planning.",
      trend: data.activeCleaners > 0 ? "up" : "flat",
      intensity: clampIntensity(data.activeCleaners * 8),
    },
    {
      id: "jobs",
      label: "Upcoming Jobs",
      value: `${data.upcomingJobs}`,
      detail: "Scheduled work entered into the command center.",
      trend: data.upcomingJobs > 0 ? "up" : "flat",
      intensity: clampIntensity(data.upcomingJobs * 4),
    },
    {
      id: "leads",
      label: "New Leads",
      value: `${data.newLeads}`,
      detail: "Prospects entered from calls, web, and campaigns.",
      trend: data.newLeads > 0 ? "up" : "flat",
      intensity: clampIntensity(data.newLeads * 7),
    },
  ];
}

export function buildDailyBriefings(data: BusinessData): Briefing[] {
  return [
    createBriefing(data, "morning", "Morning briefing", "7:30 AM"),
    createBriefing(data, "midday", "Midday operations check", "12:30 PM"),
    createBriefing(data, "nightly", "Nightly wrap-up", "8:30 PM"),
  ];
}

export function parseListInput(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function createBriefing(data: BusinessData, period: Briefing["period"], title: string, scheduledFor: string): Briefing {
  return {
    id: `briefing-${period}`,
    title,
    period,
    scheduledFor,
    revenue: formatRevenue(data.revenue),
    newBookings: data.newBookings,
    missedCalls: data.missedCalls,
    newLeads: data.newLeads,
    openCustomerIssues: data.openCustomerIssues,
    cleanerAvailability: data.cleanerAvailability,
    systemHealth: data.updatedAt === defaultBusinessData.updatedAt ? "Waiting for your first data entry" : "Local business data loaded",
    completedTasks: data.completedTasks,
    approvalNeeded: data.approvalNeeded,
    opportunities: data.opportunities,
    dataLabel: "real data",
  };
}

function clampIntensity(value: number) {
  return Math.max(12, Math.min(96, value));
}
