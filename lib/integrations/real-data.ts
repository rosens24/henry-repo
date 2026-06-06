import { hasLiveIntegration } from "@/lib/integrations/live-config";

export type LiveReadResult =
  | {
      connected: true;
      dataLabel: "real data";
      summary: string;
      payload: unknown;
    }
  | {
      connected: false;
      dataLabel: "mock data";
      summary: string;
      payload?: unknown;
    };

export async function getStripeTodayRevenue(): Promise<LiveReadResult> {
  if (!hasLiveIntegration("stripe")) {
    return {
      connected: false,
      dataLabel: "mock data",
      summary: "Stripe is not connected. Revenue cannot be read from live payments yet.",
    };
  }

  const startOfDay = Math.floor(new Date(new Date().setHours(0, 0, 0, 0)).getTime() / 1000);
  const response = await fetch(`https://api.stripe.com/v1/charges?limit=100&created[gte]=${startOfDay}`, {
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
    },
  });

  if (!response.ok) {
    return {
      connected: false,
      dataLabel: "mock data",
      summary: `Stripe live read failed with status ${response.status}.`,
    };
  }

  const data = (await response.json()) as {
    data?: Array<{ amount?: number; currency?: string; paid?: boolean; refunded?: boolean }>;
  };
  const charges = data.data ?? [];
  const paidCharges = charges.filter((charge) => charge.paid && !charge.refunded);
  const cents = paidCharges.reduce((total, charge) => total + (charge.amount ?? 0), 0);
  const currency = paidCharges[0]?.currency?.toUpperCase() ?? "USD";
  const amount = new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);

  return {
    connected: true,
    dataLabel: "real data",
    summary: `Stripe live revenue today is ${amount} across ${paidCharges.length} paid charges.`,
    payload: { amount, paidChargeCount: paidCharges.length, currency },
  };
}

export async function getGithubRepoStatus(): Promise<LiveReadResult> {
  if (!hasLiveIntegration("github")) {
    return {
      connected: false,
      dataLabel: "mock data",
      summary: "GitHub token is not connected. Repo reads are unavailable from Henry IV.",
    };
  }

  const owner = process.env.GITHUB_OWNER || "rosens24";
  const repo = process.env.GITHUB_REPO || "henry-repo";
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "henry-iv-dashboard",
    },
  });

  if (!response.ok) {
    return {
      connected: false,
      dataLabel: "mock data",
      summary: `GitHub live read failed with status ${response.status}.`,
    };
  }

  const data = (await response.json()) as { full_name?: string; default_branch?: string; pushed_at?: string };

  return {
    connected: true,
    dataLabel: "real data",
    summary: `GitHub repo ${data.full_name ?? `${owner}/${repo}`} is connected on ${data.default_branch ?? "main"}. Last push: ${data.pushed_at ?? "unknown"}.`,
    payload: data,
  };
}

export async function getSupabaseStatus(): Promise<LiveReadResult> {
  if (!hasLiveIntegration("supabase")) {
    return {
      connected: false,
      dataLabel: "mock data",
      summary: "Supabase is not connected with a service role key. Database reads are unavailable.",
    };
  }

  return {
    connected: true,
    dataLabel: "real data",
    summary: "Supabase credentials are configured. Add table names to enable live Cleanz booking/customer reads.",
    payload: { urlConfigured: Boolean(process.env.SUPABASE_URL) },
  };
}
