import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { links, clicks } from "./schema";

const client = createClient({
  url: process.env.DATABASE_URL ?? "file:local.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const db = drizzle(client);

const REFERRERS = [
  "twitter.com",
  "facebook.com",
  "reddit.com",
  "google.com",
  "linkedin.com",
  "direct",
];
const COUNTRIES = ["US", "GB", "DE", "FR", "JP", "BR", "CA", "AU"];
const DEVICES = ["mobile", "desktop", "tablet"];
const BROWSERS = ["Chrome", "Safari", "Firefox", "Edge", "Samsung Internet"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDateInLastDays(days: number): Date {
  const now = Date.now();
  const offset = Math.floor(Math.random() * days * 24 * 60 * 60 * 1000);
  return new Date(now - offset);
}

async function seed() {
  console.log("Seeding database...");

  // Clear existing data
  await db.delete(clicks);
  await db.delete(links);

  // Insert 3 sample links
  const sampleLinks = [
    {
      id: "seed_link_001",
      shortCode: "Abc1234",
      originalUrl: "https://example.com/blog/how-to-build-a-url-shortener",
      createdAt: new Date("2026-02-18T10:00:00Z"),
    },
    {
      id: "seed_link_002",
      shortCode: "Xyz5678",
      originalUrl: "https://github.com/drizzle-team/drizzle-orm",
      createdAt: new Date("2026-02-20T14:30:00Z"),
    },
    {
      id: "seed_link_003",
      shortCode: "Qrs9012",
      originalUrl:
        "https://nextjs.org/docs/app/building-your-application/routing",
      createdAt: new Date("2026-02-22T09:15:00Z"),
    },
  ];

  await db.insert(links).values(sampleLinks);
  console.log(`Inserted ${sampleLinks.length} links`);

  // Insert 60 click events spread across links and the last 7 days
  const clickRows: {
    linkId: string;
    clickedAt: Date;
    referrer: string;
    country: string;
    device: string;
    browser: string;
  }[] = [];

  // Link 1 gets ~30 clicks (most popular)
  for (let i = 0; i < 30; i++) {
    clickRows.push({
      linkId: "seed_link_001",
      clickedAt: randomDateInLastDays(7),
      referrer: pick(REFERRERS),
      country: pick(COUNTRIES),
      device: pick(DEVICES),
      browser: pick(BROWSERS),
    });
  }

  // Link 2 gets ~20 clicks
  for (let i = 0; i < 20; i++) {
    clickRows.push({
      linkId: "seed_link_002",
      clickedAt: randomDateInLastDays(7),
      referrer: pick(REFERRERS),
      country: pick(COUNTRIES),
      device: pick(DEVICES),
      browser: pick(BROWSERS),
    });
  }

  // Link 3 gets ~10 clicks
  for (let i = 0; i < 10; i++) {
    clickRows.push({
      linkId: "seed_link_003",
      clickedAt: randomDateInLastDays(7),
      referrer: pick(REFERRERS),
      country: pick(COUNTRIES),
      device: pick(DEVICES),
      browser: pick(BROWSERS),
    });
  }

  await db.insert(clicks).values(clickRows);
  console.log(`Inserted ${clickRows.length} clicks`);

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
