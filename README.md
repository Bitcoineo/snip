# Snip

URL shortener with per-click analytics. Paste a long URL, get a 7-character short link, and track every click with referrer, country, device, and browser breakdowns.

**Stack:** `Next.js 14 · TypeScript · Drizzle ORM · Turso (SQLite) · Tailwind CSS · Vercel`

**Live:** https://snip-bitcoineo.vercel.app

---

## Why I built this

I wanted to understand how URL shorteners actually work end to end: redirect handling, click capture at the edge, analytics aggregation, and QR generation. Snip is the result. Every click goes through a Next.js route handler that records metadata before redirecting, and the dashboard aggregates it into charts with configurable time ranges.

## Features

- **URL shortening** 7-character short codes, instant redirect
- **Click analytics** Referrer, country, device, and browser tracked on every click
- **Per-link dashboard** SVG bar charts with 7, 14, 30, and 90-day time range selector
- **QR code generationwnloadable PNG QR code for every short link
- **Rate limiting** 10 requests per minute per IP on link creation
- **Dark / Light theme** System preference detection, no flash on load

## Setup

    git clone https://github.com/Bitcoineo/snip.git
    cd snip
    pnpm install
    cp .env.example .env

Run migrations:

    pnpm db:generate
    pnpm db:migrate
    pnpm db:seed

Start dev server:

    pnpm dev

Open http://localhost:3000

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | No | Turso database URL. Defaults to file:./local.db |
| DATABASE_AUTH_TOKEN | No | Turso auth token. Not needed for local dev |

## Deploy to Vercel

1. Push to GitHub
2. Import the repo on Vercel
3. Add DATABASE_URL and DATABASE_AUTH_TOKEN environment variables
4. Deploy

## GitHub Topics

`nextjs` `typescript` `url-shortener` `analytics` `drizzle-orm` `turso` `sqlite` `tailwind` `vercel` `qr-code`
