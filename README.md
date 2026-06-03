# Mogadishu Urban Growth Observatory

Smart City GIS platform for analyzing urban growth in Mogadishu (2014–2026).

**Live repo:** https://github.com/Daacad44/Mogadishu-Observ

## Tech Stack

- **Frontend:** Vite 6, React 19, TypeScript, Tailwind CSS 4, React Router 7
- **Maps:** Leaflet (lazy-loaded, canvas-optimized)
- **Charts:** Recharts (code-split per route)
- **Auth & DB:** Supabase (PostgreSQL + RLS)
- **Deployment:** Vercel (static SPA + serverless API)

## Quick Start

```bash
npm install
cp .env.example .env
# Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Database Setup

Run migrations **in order** in the Supabase SQL Editor:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_super_admin.sql`
3. `supabase/migrations/003_seed_data.sql`
4. `supabase/migrations/004_contact_messages.sql`

Full schema reference: `supabase/schema.sql`  
Setup guide: `supabase/README.md`

## User Roles

| Role | Public site | Dashboard `/dashboard` | Admin `/admin` |
|------|-------------|------------------------|----------------|
| `user` | Yes | No | No |
| `analyst` | Yes | No | No |
| `admin` | Yes | Yes | Yes |
| `super_admin` | Yes | Yes | Yes + user management |

Promote your account after registering:

```sql
UPDATE profiles SET role = 'super_admin' WHERE email = 'your@email.com';
```

## Pages

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Home dashboard |
| `/map` | Public | Interactive GIS map |
| `/prediction` | Public | AI growth forecasts |
| `/reports` | Public | Research reports |
| `/contact` | Public | Contact form (saved to DB) |
| `/login` | Public | Sign in |
| `/register` | Public | Create account |
| `/dashboard` | Admin | Analytics dashboard |
| `/admin` | Admin | Command center |
| `/admin/messages` | Admin | Contact inbox |
| `/admin/analytics` | Admin | Live usage analytics |

## Deploy to Vercel

1. Import [github.com/Daacad44/Mogadishu-Observ](https://github.com/Daacad44/Mogadishu-Observ) in Vercel
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in project settings
3. Deploy — `vercel.json` is preconfigured

## Performance

- Route-level code splitting (map, charts, admin load on demand)
- Supabase-first data layer with in-memory fallback
- Manual vendor chunks (react, leaflet, recharts, supabase)
- Brotli + gzip compression on build
