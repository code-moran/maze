# Maze

Premium TV mounts, solar lights, guards, cables, and installation services.

## Architecture

Fully Vercel-hosted stack:

| Layer | Tech |
|-------|------|
| Frontend | Next.js App Router (`apps/web`) |
| Admin CMS | Custom `/admin` (Prisma + Postgres) |
| Optional CMS | Sanity Studio at `/studio` |
| Enquiries | Prisma `Enquiry` model + Resend |
| Static fallback | `apps/web/data/defaultSiteData.json` when `DATABASE_URL` is unset or empty |

## Local development

```bash
cd apps/web
cp .env.example .env.local
npm install
npm run dev
```

Open:

- Site: http://localhost:3000
- Admin: http://localhost:3000/admin (needs `ADMIN_DASHBOARD_SECRET`)
- Sanity Studio: http://localhost:3000/studio (needs Sanity project env vars)

### Database + seed

1. Set `DATABASE_URL` (or `POSTGRES_URL`) to a Neon/Vercel Postgres connection string
2. Set `ADMIN_DASHBOARD_SECRET` to a long random string
3. Push schema and seed defaults:

```bash
npm run db:push
npm run db:seed
```

Without a database, the public site still serves `defaultSiteData.json`. Admin saves require Postgres.

## Routes

| Path | Content |
|------|---------|
| `/` | Home |
| `/products` | Products browser (`?cat=` / `&sub=`) |
| `/services` | Installation services |
| `/about` | About |
| `/blog`, `/blog/[slug]` | Blog |
| `/location` | Showroom + map |
| `/contact` | Contact form |
| `/admin` | Maze content admin (settings, pages, products, blogs, SEO, inquiries) |
| `/studio` | Sanity Studio (optional; separate from the thin CMS) |
| `/sitemap.xml` | Dynamic sitemap (pages, categories, products, blogs) |
| `/robots.txt` | Crawler rules + sitemap pointer |

Redirects: `/dashboard` → `/admin`; `maze-technologies.html` → `/`.

Set `NEXT_PUBLIC_SITE_URL` (e.g. `https://your-domain.com`) so canonical URLs and the sitemap use the correct origin.

## Admin

Sign in at `/admin/login` with `ADMIN_DASHBOARD_SECRET` (falls back to `ADMIN_ENQUIRIES_SECRET`). Session is an httpOnly cookie used for `/admin` and `/api/admin/*`.

Nav sections: Overview · Settings · Charges · Pages · Products · Sub-products · Blogs · SEO · Inquiries.

The public site loads content from **Postgres** (thin CMS) when `DATABASE_URL` is set, otherwise from `defaultSiteData.json`. Sanity Studio edits live in Sanity and are separate unless you point the site loader at Sanity.

Admin saves appear on the site within about **60 seconds** (ISR).
## Enquiries

1. Add **Postgres** → `DATABASE_URL` / `POSTGRES_URL`
2. Add **Resend** → `RESEND_API_KEY`, `ADMIN_EMAIL`, optional `RESEND_FROM`
3. Run `npm run db:push` so the `enquiries` table exists

Contact form posts to `POST /api/enquiries` with honeypot + rate limiting. Inbox lives under Admin → Inquiries.

## Deploy on Vercel

**Recommended:** set the project Root Directory to `apps/web`.

1. Vercel → Project → **Settings → General → Root Directory** → `apps/web`
2. Framework Preset: **Next.js** (auto)
3. Build Command: `npm run build` (runs `prisma generate && next build`)
4. Install Command: `npm install` (default; `postinstall` generates Prisma client)
5. Output Directory: leave **empty**
6. Add environment variables from [`apps/web/.env.example`](apps/web/.env.example)
7. After first deploy with `DATABASE_URL`, run `npm run db:push` and `npm run db:seed` locally (or via a one-off job) against production

If Root Directory stays at the repo root, the root [`vercel.json`](vercel.json) already points install/build at `apps/web`.

## Design source of truth

Visual styles come from `styles/maze.css` (ported from the original `css/styles.css`). Do not redesign Bootstrap class usage without matching the static site.

## Legacy static files

Root `index.html`, `dashboard.html`, and `js/` remain as a visual checklist during migration. Production should serve `apps/web` only.
