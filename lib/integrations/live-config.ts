export type IntegrationName = "openai" | "gmail" | "calendar" | "stripe" | "twilio" | "supabase" | "github" | "vercel" | "cloudflare";

const integrationEnv: Record<IntegrationName, string[]> = {
  openai: ["OPENAI_API_KEY"],
  gmail: ["GMAIL_CLIENT_ID", "GMAIL_CLIENT_SECRET"],
  calendar: ["GOOGLE_CALENDAR_ID"],
  stripe: ["STRIPE_SECRET_KEY"],
  twilio: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN"],
  supabase: ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"],
  github: ["GITHUB_TOKEN"],
  vercel: ["VERCEL_TOKEN"],
  cloudflare: ["CLOUDFLARE_API_TOKEN"],
};

export function hasLiveIntegration(name: IntegrationName) {
  return integrationEnv[name].every((key) => isLiveEnvValue(process.env[key]));
}

export function getIntegrationDetail(name: IntegrationName) {
  const required = integrationEnv[name];
  const missing = required.filter((key) => !isLiveEnvValue(process.env[key]));

  if (missing.length === 0) {
    return `${name} credentials detected. Read-only checks can use live configuration.`;
  }

  return `${name} is not connected. Missing live env: ${missing.join(", ")}.`;
}

export function isLiveEnvValue(value: string | undefined) {
  if (!value) return false;

  const normalized = value.trim().toLowerCase();

  return !normalized.includes("fake") && !normalized.includes("placeholder") && !normalized.includes("example") && normalized.length > 8;
}
