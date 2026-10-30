import type { User, Webhook } from "../api/types";

export const MOCK_CREDENTIALS = {
  email: "demo@example.com",
  password: "password123",
} as const;

export const MOCK_USER: User = {
  id: 1,
  email: MOCK_CREDENTIALS.email,
  first_name: "Vasyl",
  last_name: "Bzdyr",
  name: "Vasyl Bzdyr",
};

export const MOCK_CSRF_TOKEN = "b4c1d2e3f40516273849a0b1c2d3e4f5";

const EVENTS = [
  "Order created",
  "Order paid",
  "Order shipped",
  "Order cancelled",
  "Subscriber added",
  "Subscriber unsubscribed",
  "Message delivered",
  "Message failed",
  "Campaign started",
  "Campaign finished",
  "Invoice issued",
  "Invoice paid",
  "Payment refunded",
  "Chat opened",
  "Chat closed",
  "Lead captured",
  "Lead qualified",
  "Bot flow completed",
  "Tag assigned",
  "Tag removed",
  "Contact updated",
  "Contact deleted",
  "Form submitted",
  "Ticket created",
  "Ticket resolved",
  "Trial started",
  "Trial expired",
  "Daily report",
];

const HOSTS = [
  "api.example.com",
  "hooks.acme.io",
  "crm.example.org",
  "n8n.example.net",
];

const BASE_DATE = Date.UTC(2026, 0, 5, 9, 30);
const DAY_MS = 24 * 60 * 60 * 1000;

function slugify(value: string): string {
  return value.toLowerCase().replace(/\s+/g, "-");
}

export function createSeedWebhooks(): Webhook[] {
  return EVENTS.map((name, index) => ({
    id: index + 1,
    name,
    url: `https://${HOSTS[index % HOSTS.length]}/webhooks/${slugify(name)}`,
    active: index % 3 !== 2,
    created_at: new Date(BASE_DATE + index * DAY_MS).toISOString(),
  }));
}
