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

## Current connected setup and safe verification

The repository's feature branch is already configured to use the connected Supabase project. The browser uses only the Supabase publishable key; never add a service-role key to client-side files. The database schema and RLS policies have been applied, and one Auth user has a provisioned admin profile.

Before production use:
1. Open the isolated admin preview and sign in with the provisioned account. Do not share the password in chat.
2. Confirm the mission list loads, then create or edit a clearly labelled test draft only if you are comfortable writing to the connected database. The current project contains an existing mission and audit history, so do not reset or overwrite existing data.
3. Confirm password recovery works and check the Supabase Auth redirect URL / SMTP configuration.
4. Keep public sign-ups disabled. Provision staff only by inserting their actual Auth user UUID into `public.admin_profiles` from a trusted SQL editor.
5. Test a separate reviewer account to confirm it can read but cannot insert, update, or delete mission records.
6. Enable Supabase leaked-password protection before production use: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

Do not rerun setup instructions intended for a brand-new database.

## Important architecture notes

- The portal currently saves mission records to Supabase; the existing public website is still static HTML and is **not yet connected** to this database.
- "Approved" means approved for a future integration; it does not deploy anything.
- Before connecting the live website, migrate the existing destination pages to a shared data-driven renderer or add a carefully reviewed publishing step. Preserve the homepage, UAE page, current logo asset, and current country-page visual style.
- Keep publishing gated behind a separate branch / pull request and explicit owner approval. Do not auto-deploy content directly from the admin UI.
- Destination image field currently accepts a URL. A future phase can add private/admin-managed Supabase Storage with public display URLs and image rights metadata.
- Consider adding audit history, role-specific UI restrictions, password reset UX, validation for fee components, and a staging preview before production rollout.

## Open locally

Serve the repository root using any static file server and open `/admin/`. A browser opened directly with `file://` may block some resources. GitHub Pages does not protect static admin files; actual data access relies on Supabase Auth and RLS, so never put secrets in the front end.


## Backups, validation and audit trail

- The dashboard includes a JSON export backup and a restore flow. Restore validates the file shape, required fields, URL slugs, status values, non-negative whole-number pricing and duplicate slugs before writing.
- Export a fresh JSON backup before major batch edits and keep copies in an approved, access-controlled location. A browser download is an application-level backup, not a replacement for Supabase's managed database backups / point-in-time recovery. Configure the appropriate database backup retention in the Supabase project and test restore procedures periodically.
- The schema includes an append-only-style audit log for staff actions. RLS permits staff to append events and read the log; do not grant update/delete policies to ordinary users.
- The client validates prices as non-negative whole INR amounts and requires the component total to be explicit in preview. Always verify official fee sources before marking a mission approved.
- Secure access is enforced by Supabase Auth and RLS, not by hiding UI buttons. Provision only named users in `admin_profiles`; do not enable public sign-up.
