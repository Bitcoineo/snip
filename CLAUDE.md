# Snip — URL Shortener with Analytics

## Project Overview

Snip is a URL shortener with per-link click analytics. Anyone can submit a long URL and get a 7-character short code back. Every click on a short link is tracked with timestamp, referrer, country, device, and browser. A dashboard shows analytics per link.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **ORM:** Drizzle ORM
- **Database:** libSQL (SQLite) — local file for dev, Turso for production
- **Package Manager:** pnpm
- **Validation:** Zod
- **UA Parsing:** ua-parser-js
- **Geo:** Vercel `x-vercel-ip-country` header (no geoip-lite)

## File Structure

```
src/
  app/
    page.tsx                         # Home page (shorten form + link list)
    layout.tsx                       # Root layout (dark mode, fonts, footer)
    [code]/route.ts                  # Redirect handler (GET /:code → 302)
    api/links/route.ts               # POST /api/links, GET /api/links
    api/links/[code]/stats/route.ts  # GET /api/links/:code/stats
    dashboard/[code]/page.tsx        # Per-link analytics dashboard
  components/
    ShortenForm.tsx                  # URL input form with result display
    LinkList.tsx                     # Recent links list with skeleton loading
    ClickChart.tsx                   # SVG bar chart for clicks per day
    StatsCard.tsx                    # Reusable breakdown card (referrers, etc.)
    CopyButton.tsx                   # Copy-to-clipboard button
  db/
    schema.ts                        # Drizzle schema (links + clicks tables)
    index.ts                         # DB client singleton
    seed.ts                          # Seed script (3 links, 60 clicks)
  lib/
    links.ts                         # createLink, getLinkByCode, getLinks
    clicks.ts                        # recordClick (fire-and-forget)
    analytics.ts                     # getClicksPerDay, getTop* breakdowns
    parse-headers.ts                 # Extract referrer, country, device, browser
    rate-limit.ts                    # In-memory fixed-window rate limiter
  middleware.ts                      # Rate limit middleware (POST /api/links only)
drizzle.config.ts                    # Drizzle Kit config → local.db
```

## Database Schema

### links

| Column       | Type         | Constraints              |
|-------------|-------------|--------------------------|
| id          | TEXT (CUID2) | PRIMARY KEY              |
| short_code  | VARCHAR(7)   | UNIQUE, NOT NULL         |
| original_url| VARCHAR(2048)| NOT NULL                 |
| created_at  | TIMESTAMP    | NOT NULL, DEFAULT NOW()  |

Indexes: `UNIQUE idx_links_short_code(short_code)`

### clicks

| Column     | Type          | Constraints                      |
|-----------|--------------|----------------------------------|
| id        | INTEGER       | PRIMARY KEY, AUTOINCREMENT       |
| link_id   | TEXT          | NOT NULL, FK → links(id)         |
| clicked_at| TIMESTAMP     | NOT NULL, DEFAULT NOW()          |
| referrer  | VARCHAR(2048) | NULLABLE                         |
| country   | CHAR(2)       | NULLABLE (ISO 3166-1 alpha-2)    |
| device    | VARCHAR(10)   | NULLABLE (mobile/desktop/tablet) |
| browser   | VARCHAR(50)   | NULLABLE                         |

Indexes:
- `idx_clicks_link_id(link_id)`
- `idx_clicks_link_date(link_id, clicked_at)` — clicks per day
- `idx_clicks_link_referrer(link_id, referrer)` — top referrers
- `idx_clicks_link_country(link_id, country)` — top countries

## API Contract

| Method | Path                        | Description           | Status |
|--------|----------------------------|-----------------------|--------|
| POST   | /api/links                 | Create short link     | 201    |
| GET    | /api/links                 | List all links        | 200    |
| GET    | /api/links/:code/stats     | Link analytics        | 200    |
| GET    | /:code                     | Redirect to original  | 302    |

Error format: `{ "error": "ERROR_CODE", "message": "Description" }`

Rate limit on POST /api/links: 10 requests/minute per IP → 429 when exceeded.

## Key Decisions

### 302 Redirects (not 301)
301 is cached by browsers — future visits skip the server, so clicks are never recorded. 302 ensures every visit hits the server for tracking.

### 7-Character Short Codes
Generated with nanoid using a-z, A-Z, 0-9 (62^7 = ~3.5 trillion combinations). Collision handled by retry (up to 3 attempts, caught by UNIQUE constraint).

### Route Disambiguation
App routes use `/api/*` and `/dashboard/*` prefixes. The `/:code` route only matches exactly 7 alphanumeric characters — no DB lookup needed to distinguish from app pages.

### In-Memory Rate Limiting
Fixed window: 10 requests per 60 seconds per IP. Stored in a Map keyed by IP with `{ count, windowStart }`. Resets automatically when the window expires. Swap to Redis if scaling to multiple instances.

### Vercel Geo Headers
Country is read from `x-vercel-ip-country` (free on Vercel). Falls back to `null` in local dev. No geoip-lite dependency needed.

### Async Click Tracking
Click inserts are fire-and-forget — the redirect returns immediately without waiting for the DB write.

## Coding Standards

- **Validation:** All request input validated with Zod schemas
- **Error format:** Always `{ error: string, message: string }` — never throw raw errors to the client
- **Types:** No `any` — strict TypeScript throughout
- **Imports:** Use `@/*` path alias (maps to `src/*`)
- **DB queries:** Use Drizzle query builder, not raw SQL
