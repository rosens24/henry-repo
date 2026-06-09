import { createMockBotConnector } from "@/lib/bots/mock-bot-factory";

export const botConnectors = {
  gmail: createMockBotConnector("gmail"),
  calendar: createMockBotConnector("calendar"),
  stripe: createMockBotConnector("stripe"),
  twilio: createMockBotConnector("twilio"),
  supabase: createMockBotConnector("supabase"),
  github: createMockBotConnector("github"),
  vercel: createMockBotConnector("vercel"),
  cloudflare: createMockBotConnector("cloudflare"),
  realEstateData: createMockBotConnector("real-estate-data"),
  acquisitionCrm: createMockBotConnector("acquisition-crm"),
};

export function getBotConnectorStatuses() {
  return Object.values(botConnectors).map((connector) => connector.status());
}
