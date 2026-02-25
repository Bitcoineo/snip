# Snip

A URL shortener with per-link click analytics. Shorten URLs, track every click with referrer, country, device, and browser breakdowns.

## Tech Stack

- **Next.js 14** (App Router) + TypeScript (strict)
- **Drizzle ORM** + libSQL (SQLite locally, Turso in production)
- **Tailwind CSS** — dark mode by default

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Setup

```bash
# Install dependencies
pnpm install

# Create environment file
cp .env.example .env

# Run database migrations
pnpm db:migrate

# Seed sample data (optional)
pnpm db:seed

# Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start development server |
| `pnpm build` | Run migrations + production build |
| `pnpm start` | Start production server |
| `pnpm db:generate` | Generate new Drizzle migration |
| `pnpm db:migrate` | Apply pending migrations |
| `pnpm db:seed` | Seed database with sample data |

## API

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/links` | Create a short link |
| `GET` | `/api/links` | List all links (paginated) |
| `GET` | `/api/links/:code/stats` | Analytics for a link |
| `GET` | `/:code` | Redirect to original URL (302) |

## Production (Turso)

1. Create a Turso database at [turso.tech](https://turso.tech)
2. Set `DATABASE_URL` and `DATABASE_AUTH_TOKEN` in your environment
3. Deploy to Vercel — geo country headers work automatically
