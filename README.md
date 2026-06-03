# Mogadishu Urban Growth Observatory

High-performance GIS platform built with **Vite + React** for analyzing urban growth in Mogadishu (2014–2026).

## Tech Stack

- **Frontend:** Vite 6, React 19, TypeScript, Tailwind CSS 4, React Router 7
- **Maps:** Leaflet (lazy-loaded, canvas-optimized)
- **Charts:** Recharts (code-split per route)
- **Auth & DB:** Supabase
- **Deployment:** Vercel (static SPA + serverless API)

## Quick Start

```bash
npm install
cp .env.example .env
# Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Performance

- Route-level code splitting (map, charts, admin load on demand)
- In-memory data layer — zero network latency for GIS analytics
- Manual vendor chunks (react, leaflet, recharts, supabase)
- Brotli + gzip compression on build
- 5-minute TanStack Query cache

## Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables from `.env.example`
4. Deploy — `vercel.json` is preconfigured

## Authentication

Register at `/register`, sign in at `/login`. Promote admin:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home |
| `/map` | Interactive GIS map |
| `/dashboard` | Analytics |
| `/prediction` | AI forecasts |
| `/reports` | Download reports |
| `/login` | Sign in |
| `/register` | Create account |
| `/admin` | Admin panel |
