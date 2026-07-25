# Maze

Premium TV mounts, solar lights, guards, cables, and installation services.

## Architecture

Fully Vercel-hosted stack:

| Layer | Tech |
|-------|------|
| Frontend | Next.js App Router (`apps/web`) |
| CMS | Sanity Studio at `/studio` |
| Enquiries | Vercel Postgres + Resend |
| Static fallback | `apps/web/data/defaultSiteData.json` when Sanity env is unset |

## Local development

```bash
cd apps/web
cp .env.example .env.local   # optional — works without Sanity/Postgres
npm install
npm run dev
```

Open:

- Site: http://localhost:3000
- Studio: http://localhost:3000/studio (needs Sanity project env)
- Enquiries inbox: http://localhost:3000/admin/enquiries

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
| `/studio` | Sanity CMS |
| `/admin/enquiries` | Enquiry inbox (secret) |

Redirects: `/dashboard` → `/studio`, `maze-technologies.html` → `/`.

## Sanity setup

1. Create a project at https://www.sanity.io/manage
2. Set in `.env.local`:
   - `NEXT_PUBLIC_SANITY_PROJECT_ID`
   - `NEXT_PUBLIC_SANITY_DATASET=production`
   - `SANITY_API_WRITE_TOKEN` (Editor) for seeding
   - `SANITY_API_READ_TOKEN` (Viewer) optional for private drafts
3. Open `/studio` and sign in
4. Seed defaults: `npm run seed:sanity`

Until Sanity is configured, the site serves the migrated static JSON (same content as the old site).

Published Studio edits appear on the site within about **60 seconds** (ISR). For instant updates, add a Sanity webhook:

1. Set `SANITY_REVALIDATE_SECRET` in Vercel env
2. Sanity → API → Webhooks → URL `https://<your-domain>/api/revalidate-sanity`
3. Header `Authorization: Bearer <same secret>` (or `?secret=` query)
4. Trigger on create/update/delete for your dataset

## Enquiries

1. Add **Vercel Postgres** (or Neon) → `POSTGRES_URL`
2. Add **Resend** → `RESEND_API_KEY`, `ADMIN_EMAIL`, optional `RESEND_FROM`
3. Set `ADMIN_ENQUIRIES_SECRET` for `/admin/enquiries`

Contact form posts to `POST /api/enquiries` with honeypot + rate limiting.

## Deploy on Vercel

**Recommended:** set the project Root Directory to `apps/web`.

1. Vercel → Project → **Settings → General → Root Directory** → `apps/web`
2. Framework Preset: **Next.js** (auto)
3. Build Command: `npm run build` (default)
4. Install Command: `npm install` (default)
5. Output Directory: leave **empty** (Next.js manages this)
6. Add environment variables from [`apps/web/.env.example`](apps/web/.env.example)

If Root Directory stays at the repo root, the root [`vercel.json`](vercel.json) already points install/build at `apps/web`. Prefer the Root Directory setting so Studio and env stay scoped to the Next app.

After changing Root Directory, trigger a redeploy.

## Design source of truth

Visual styles come from `styles/maze.css` (ported from the original `css/styles.css`). Do not redesign Bootstrap class usage without matching the static site.

## Legacy static files

Root `index.html`, `dashboard.html`, and `js/` remain as a visual checklist during migration. Production should serve `apps/web` only.
