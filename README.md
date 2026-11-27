# Sacred Circle

A calm, senior-friendly website for Sacred Circle: free weekly Sunday meditation, gentle healing practices, community links and a private materials library.

## Run locally

```bash
npm install
npm run dev
```

The site works without a backend using bundled sample content. Copy `.env.example` to `.env.local` and add your Supabase URL and anon key to enable live content, Google admin sign-in and PIN-protected materials.

## Supabase setup

1. Create a free Supabase project.
2. Run [`supabase/schema.sql`](supabase/schema.sql) in the SQL editor.
3. Enable Google as an auth provider and add `sacredcircle45@gmail.com` plus your development Gmail to `admin_allowlist`.
4. Add the Supabase URL and anon key to `.env.local`, then restart Vite.

Visitors never sign in. Public access is limited to `site_settings`, active announcements, visible reviews and the sanitized `public_materials` view. Locked media URLs are returned only by `verify_material_pin(material_id, input_pin)`, and admin writes are restricted to allowlisted Google emails via RLS.

## Deploy

Deploy to Vercel with the framework preset `Vite`. `vercel.json` rewrites all routes to `index.html`. Add the same `VITE_*` variables in the Vercel project settings.

## Content

- Founder, reviewer and logo assets live in `src/assets/media/` and are registered in `src/config/mediaManifest.ts`.
- Fallback copy, links and exact bilingual hero lines live in `src/config/`.
- Verbatim testimonials live in `src/config/reviews.ts`; admins can publish edits from `/admin`.
- The public material seeds are in `src/config/materials.ts`; real content is managed from Supabase.

## Commands

- `npm run dev` — local development
- `npm run typecheck` — TypeScript only
- `npm run build` — typecheck + production build
- `npm run preview` — serve the production build locally
