# Supabase Database Setup

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a project.
2. Copy **Project URL** and **anon public key** into your `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...your-full-key
```

## 2. Run migrations (SQL Editor)

Open **SQL Editor** in Supabase and run each file **in order**:

| Order | File | Purpose |
|-------|------|---------|
| 1 | `migrations/001_initial_schema.sql` | Creates all 8 tables, indexes, RLS |
| 2 | `migrations/002_super_admin.sql` | Super admin role + policies |
| 3 | `migrations/003_seed_data.sql` | Seed districts, growth, reports, layers |
| 4 | `migrations/004_contact_messages.sql` | Contact form messages table + RLS |
| 5 | `migrations/006_create_super_admin_account.sql` | Creates observatory@mug.so super admin |

## 3. Create your admin account

1. Register at `/register` on the public site.
2. Promote your account in SQL Editor:

```sql
-- Super admin (full access + user management)
UPDATE profiles
SET role = 'super_admin', updated_at = NOW()
WHERE email = 'your-email@example.com';

-- Or regular admin (dashboard access, no user management)
UPDATE profiles
SET role = 'admin', updated_at = NOW()
WHERE email = 'your-email@example.com';
```

## 4. Database tables

| Table | Description |
|-------|-------------|
| `profiles` | User accounts and roles |
| `districts` | Mogadishu districts |
| `urban_growth` | Yearly built-up area per district |
| `building_density` | Building counts and density |
| `predictions` | ML urban expansion forecasts |
| `reports` | Published research reports |
| `gis_layers` | Map layer configuration |
| `analytics_logs` | Platform usage events |
| `contact_messages` | Public contact form submissions |

Full schema reference: [`schema.sql`](./schema.sql)

## 5. Role access

| Role | Public web site | Dashboard `/dashboard` | Admin `/admin` |
|------|-----------------|------------------------|----------------|
| `user` | Yes | No | No |
| `analyst` | Yes | No | No |
| `admin` | Yes | Yes | Yes |
| `super_admin` | Yes | Yes | Yes + user management |

## 6. Verify

After migrations, confirm seed data:

```sql
SELECT COUNT(*) FROM districts;        -- 10
SELECT COUNT(*) FROM urban_growth;     -- 130 (10 districts × 13 years)
SELECT COUNT(*) FROM building_density; -- 130
SELECT COUNT(*) FROM reports;         -- 3
SELECT COUNT(*) FROM gis_layers;      -- 4
```

Run the app: `npm run dev` → data loads from Supabase automatically.
