import type { DashboardMetric, JarvisMessage } from "@/lib/ai/types";

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

export const mockOperationalSnapshot = {
  revenue: "$4,820",
  newBookings: 18,
  missedCalls: 5,
  activeCleaners: 12,
  upcomingJobs: 27,
  newLeads: 9,
};

export const mockDashboardMetrics: DashboardMetric[] = [
  {
    id: "bookings",
    label: "New Bookings",
    value: `${mockOperationalSnapshot.newBookings}`,
    detail: "Fresh booking requests waiting in the command queue.",
    trend: "up",
    intensity: 72,
  },
  {
    id: "cleaners",
    label: "Active Cleaners",
    value: `${mockOperationalSnapshot.activeCleaners}`,
    detail: "Mock team members marked active for dispatch.",
    trend: "up",
    intensity: 64,
  },
  {
    id: "jobs",
    label: "Upcoming Jobs",
    value: `${mockOperationalSnapshot.upcomingJobs}`,
    detail: "Scheduled work visible in future calendar phase.",
    trend: "up",
    intensity: 78,
  },
  {
    id: "leads",
    label: "New Leads",
    value: `${mockOperationalSnapshot.newLeads}`,
    detail: "Prospects from web, calls, and mock campaign sources.",
    trend: "up",
    intensity: 58,
  },
];

export const initialMessages: JarvisMessage[] = [
  {
    id: "henry-boot",
    role: "assistant",
    content:
      "Henry IV command layer initialized. I can summarize today, inspect bookings, and stage future actions without touching live systems.",
    createdAt: new Date().toISOString(),
    source: "system",
  },
];

export const mockActivityFeed: ActivityItem[] = [
  {
    id: "activity-booking",
    title: "Mock booking added",
    detail: "Deep clean request staged for Friday review.",
    time: "09:42",
  },
  {
    id: "activity-lead",
    title: "Mock lead captured",
    detail: "Website form lead marked high intent.",
    time: "10:15",
  },
  {
    id: "activity-cleaner",
    title: "Mock cleaner availability updated",
    detail: "Two cleaners opened afternoon slots.",
    time: "11:03",
  },
];

export const mockAlerts: AlertItem[] = [
  {
    id: "alert-missed-calls",
    title: "Missed call queue",
    detail: "Mock data shows 5 missed calls. Twilio is not connected.",
    severity: "medium",
  },
  {
    id: "alert-readonly",
    title: "Read-only mode active",
    detail: "Sensitive actions are blocked until owner approval and real integrations are enabled.",
    severity: "high",
  },
];
