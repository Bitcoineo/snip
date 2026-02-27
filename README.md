# Snip

Shorten URLs. Track every click.

<!-- screenshot -->

**[Live Demo](https://snip-bitcoineo.vercel.app)**

## Features

- **URL Shortening** — paste a long URL, get a 7-character short link
- **Click Analytics** — every click is tracked with referrer, country, device, and browser
- **Real-time Dashboard** — per-link analytics with SVG bar charts and breakdown cards
- **Time Range Selector** — view stats for the last 7, 14, 30, or 90 days
- **QR Code Generation** — every short link gets a downloadable QR code (PNG)
- **Rate Limiting** — 10 requests/minute per IP on link creation
- **Dark / Light Theme** — toggle between themes with system preference detection, no flash on load

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 14](https://nextjs.org) (App Router) |
| Language | TypeScript (strict mode) |
| Database | [Turso](https://turso.tech) (libSQL/SQLite) |
| ORM | [Drizzle ORM](https://orm.drizzle.team) |
| Styling | [Tailwind CSS](https://tailwindcss.com) |
| Hosting | [Vercel](https://vercel.com) |

## Getting Started

### Prerequisites

- Node.js 18+
- [pnpm](https://pnpm.io)

### Setup

```bash
git clone https://github.com/Bitcoineo/snip.git
cd snip
pnpm install
```

Create a `.env` file from the template:

```bash
cp .env.example .env
```

The default config uses a local SQLite file — no external database needed for development. See [Production](#production) for Turso setup.

Run migrations and optionally seed sample data:

```bash
pnpm db:migrate
pnpm db:seed    # adds 3 links + 60 click events
```

Start the dev server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start development server |
| `pnpm build` | Run migrations + production build |
| `pnpm start` | Start production server |
| `pnpm db:generate` | Generate a new Drizzle migration |
| `pnpm db:migrate` | Apply pending migrations |
| `pnpm db:seed` | Seed database with sample data |

## API Reference

### Create Short Link

```
POST /api/links
Content-Type: application/json

{ "url": "https://example.com/very/long/path" }
```

Returns `201` with the short link. Rate limited to 10 requests/minute per IP.

### List Links

```
GET /api/links?page=1&limit=20
```

Returns paginated list of all links with click counts.

### Link Analytics

```
GET /api/links/:code/stats?days=7
```

Returns clicks per day, top referrers, countries, browsers, and devices for the given time range (1–90 days).

### QR Code

```
GET /api/links/:code/qr
```

Returns the QR code as a `image/png`. Cached for 24 hours.

### Redirect

```
GET /:code → 302 redirect
```

Redirects to the original URL. Uses `302` (not `301`) so every click hits the server and is tracked. Click metadata is recorded asynchronously — the redirect is not delayed.

## Architecture

API routes in `src/app/` are thin handlers that delegate to a `src/lib/` business logic layer:

| Module | Responsibility |
|---|---|
| `links.ts` | Create links, look up by short code, list with pagination |
| `clicks.ts` | Fire-and-forget click recording |
| `analytics.ts` | Clicks per day (zero-filled), top referrers/countries/browsers/devices |
| `parse-headers.ts` | Extract referrer, country (Vercel geo header), device, and browser from request headers |
| `qrcode.ts` | QR code PNG generation for short URLs |
| `rate-limit.ts` | In-memory fixed-window rate limiter (10 req/60s per IP) |

The database layer (`src/db/`) defines the Drizzle schema and exposes a singleton client. Migrations are applied via a custom runner that works with both local SQLite and Turso.

## Production

1. Create a database at [turso.tech](https://turso.tech)
2. Set `DATABASE_URL` and `DATABASE_AUTH_TOKEN` in your Vercel environment variables (see `.env.example` for the variable names)
3. Deploy to Vercel — geo country detection via `x-vercel-ip-country` works automatically

## License

MIT
