# AL-EMAD Automotive Services — Website & CMS

Bilingual (Arabic RTL primary / English LTR) premium website for AL-EMAD with a full content-management dashboard.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion · Supabase (Postgres, Auth, Storage, Realtime)

---

## 1. Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 (redirects to `/ar`). Without Supabase configured, the public site renders from the default content in `supabase/seed-data.json` and the dashboard shows setup instructions.

## 2. Connect Supabase

1. Create a project at https://supabase.com.
2. **SQL Editor →** run `supabase/schema.sql` (tables, row-level security, storage bucket, triggers).
3. **SQL Editor →** run `supabase/seed.sql` (initial website content, services, parts, gallery, placeholder testimonials).
4. Copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Project Settings → API)
   - `SUPABASE_SERVICE_ROLE_KEY` (optional — only for inviting users from `/admin/users`; server-only)
   - `NEXT_PUBLIC_SITE_URL` (your production URL)
5. **Authentication → Users → Add user** (email + password, auto-confirm). Then in SQL Editor:
   ```sql
   update public.profiles set role = 'admin', full_name = 'مدير النظام' where email = 'you@example.com';
   ```
6. **Authentication → Providers → Email:** disable public sign-ups (staff are invited by an admin).
7. **Authentication → URL Configuration:** add `https://your-domain/admin/auth/callback` to redirect URLs (password reset & invitations).
8. Restart `npm run dev` and sign in at `/admin`.

## 3. Roles

| Role | Access |
|------|--------|
| `admin` | Everything: settings, users, content, bookings |
| `editor` | Website content only (services, parts, gallery, testimonials, page text, stats) |
| `reception` | Bookings & inquiries only |

Roles are enforced twice: in the dashboard UI/server (`lib/auth.ts`, `Guard`) and in the database via RLS (`public.has_role()`), so the browser can never bypass them. New accounts have **no role** until an admin assigns one. Visitors can only *insert* booking requests (never read them).

## 4. What the dashboard manages

- **Dashboard:** inquiries totals, new requests, published services, parts, recent bookings & messages, status breakdown.
- **Bookings & inquiries:** tabs by status, search, detail panel, status updates (new / contacted / completed / cancelled), WhatsApp & call buttons, internal notes, CSV export, live notification on new requests.
- **Services / Spare parts & categories / Gallery (images & videos) / Testimonials:** add, edit, delete, publish/unpublish, reorder, AR/EN fields, image upload (auto-compressed to WebP in the browser).
- **Page content:** every headline/description/button/image of every section in AR + EN, plus statistics counters (leave a value empty to show the `[00]` placeholder until real numbers exist).
- **Site settings (admin):** logo & favicon, brand colours (applied site-wide via CSS variables), hero video + poster + overlay, SEO title/description per language, contact details, working hours, map, social links, section visibility, navigation menu.

Every save revalidates the public pages immediately (ISR + on-demand revalidation).

## 5. Editing the seed content

`supabase/seed-data.json` is the single source for default content. After editing it, regenerate the SQL:

```bash
node scripts/build-seed.mjs
```

## 6. Media credits

All default photography and video are from **Pexels** (free to use under the Pexels License). Replace them with AL-EMAD's own workshop photos from the dashboard whenever available. Testimonials and statistics are placeholders by design — no customer reviews, figures, inventory or prices are invented.

## 7. Deploy

Deploy to Vercel (or any Node host): set the same environment variables, then `npm run build`. Make sure `NEXT_PUBLIC_SITE_URL` is the final domain for canonical URLs, sitemap and email links.
