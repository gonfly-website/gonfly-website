# GoNfly Admin Studio

A separate admin workspace for the existing GoNfly static website. This is on the `feature/gonfly-admin-portal` branch only. It does **not** edit the homepage, UAE page, or existing country pages, and nothing here is published to the live website.

## Current features

- Supabase email/password sign-in (no public sign-up screen)
- Country / visa mission CRUD with country, slug, visa type, processing time, entry type, validity, stay, description
- Editable fee components with calculated total
- Document checklist, notes, and destination image URL preview
- Draft / in-review / approved-for-integration statuses
- Customer-facing content preview
- Supabase Row Level Security (RLS) schema
- A separate review workflow; no deployment or live publishing action is wired up

## Setup required before login/data can work

1. Create a Supabase project.
2. Open **Project Settings → API** and copy the Project URL and anon/publishable key.
3. In `admin/admin.js`, replace `YOUR_SUPABASE_PROJECT_URL` and `YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY`. Only use the anon/publishable key in browser code. **Never use the service-role key in this file.**
4. In Supabase SQL Editor, run `admin/supabase-schema.sql`.
5. In Supabase Authentication, create the first user yourself. Keep public sign-ups disabled.
6. Provision that user as an admin by running the following SQL with their actual Auth user UUID:

   ```sql
   insert into public.admin_profiles (user_id, role)
   values ('YOUR_AUTH_USER_UUID', 'admin');
   ```

7. Enable email confirmation and configure password reset / SMTP settings before production use.
8. Test with an admin account and a separate non-admin account. RLS should deny access to users without an `admin_profiles` row.

## Important architecture notes

- The portal currently saves mission records to Supabase; the existing public website is still static HTML and is **not yet connected** to this database.
- "Approved" means approved for a future integration; it does not deploy anything.
- Before connecting the live website, migrate the existing destination pages to a shared data-driven renderer or add a carefully reviewed publishing step. Preserve the homepage, UAE page, current logo asset, and current country-page visual style.
- Keep publishing gated behind a separate branch / pull request and explicit owner approval. Do not auto-deploy content directly from the admin UI.
- Destination image field currently accepts a URL. A future phase can add private/admin-managed Supabase Storage with public display URLs and image rights metadata.
- Consider adding audit history, role-specific UI restrictions, password reset UX, validation for fee components, and a staging preview before production rollout.

## Open locally

Serve the repository root using any static file server and open `/admin/`. A browser opened directly with `file://` may block some resources. GitHub Pages does not protect static admin files; actual data access relies on Supabase Auth and RLS, so never put secrets in the front end.
