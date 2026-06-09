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
  cleanzCrm: CleanzCompanyRecord[];
  cedarNeckDeals: CedarNeckDealRecord[];
  healthOs: HealthOperatingSystem;
  updatedAt: string;
};

export type CleanzCompanyRecord = {
  id: string;
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  website: string;
  status: "to_call" | "called" | "follow_up" | "proposal" | "won" | "lost";
  notes: string;
  nextStep: string;
  createdAt: string;
  updatedAt: string;
};

export type CedarNeckDealRecord = {
  id: string;
  propertyName: string;
  address: string;
  dealType: "single_family" | "multifamily";
  source: string;
  status: "new" | "researching" | "contacted" | "underwriting" | "offer_ready" | "submitted" | "dead";
  askingPrice: number;
  units: number;
  notes: string;
  nextStep: string;
  createdAt: string;
  updatedAt: string;
};

export type HealthOperatingSystem = {
  food: string[];
  mind: string[];
  body: string[];
  exercise: string[];
  dailyChecklist: string[];
  weeklyReview: string;
};

export type GoalSnapshot = {
  baseGoal: number;
  currentGoal: number;
  completed: number;
  remaining: number;
  progressPercent: number;
  nextGoalAfterHit: number;
};

export const defaultHealthOs: HealthOperatingSystem = {
  food: [
    "Protein at each meal.",
    "Mostly single-ingredient foods.",
    "Water before caffeine; limit late sugar.",
  ],
  mind: [
    "Morning priorities before phone scrolling.",
    "Ten quiet minutes for planning, prayer, meditation, or journaling.",
    "End the day by writing the next clear move.",
  ],
  body: [
    "Seven to nine hours of sleep when possible.",
    "Walk daily, especially after meals.",
    "Sunlight early in the day.",
  ],
  exercise: [
    "Strength train three to four days per week.",
    "Zone 2 cardio two days per week.",
    "Mobility or stretching for five minutes daily.",
  ],
  dailyChecklist: ["Protein", "Water", "Walk", "Lift or move", "Plan", "Sleep routine"],
  weeklyReview: "Review energy, weight trend, workouts, meals, mood, and calendar pressure every Sunday.",
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
  cleanzCrm: [],
  cedarNeckDeals: [],
  healthOs: defaultHealthOs,
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
      label: "Cleanz CRM",
      value: `${data.cleanzCrm.length || data.newLeads}`,
      detail: `${buildGoalSnapshot(data.cleanzCrm.length || data.newLeads, 10).remaining} companies left for this monthly target.`,
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

export function buildGoalSnapshot(completed: number, baseGoal: number): GoalSnapshot {
  const goalMultiplier = Math.floor(completed / baseGoal) + 1;
  const currentGoal = baseGoal * goalMultiplier;

  return {
    baseGoal,
    currentGoal,
    completed,
    remaining: Math.max(0, currentGoal - completed),
    progressPercent: currentGoal === 0 ? 0 : Math.min(100, Math.round((completed / currentGoal) * 100)),
    nextGoalAfterHit: currentGoal + baseGoal,
  };
}

export function getCleanzCrmGoal(data: BusinessData) {
  return buildGoalSnapshot(data.cleanzCrm.length, 10);
}

export function getCedarNeckDealGoal(data: BusinessData) {
  return buildGoalSnapshot(data.cedarNeckDeals.length, 2);
}

function clampIntensity(value: number) {
  return Math.max(12, Math.min(96, value));
}
