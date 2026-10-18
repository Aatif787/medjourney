## Architecture rules

- Public pages read data through `createServerFn`s in `src/lib/public.functions.ts` using the publishable client (`public-client.server.ts`); RLS limits them to published rows. Why: SSR-safe and never exposes drafts or patient data.
- The admin CMS (`src/routes/_authenticated/admin/*`) talks to the database directly from the browser client; every write is enforced by RLS via `is_staff()` / `has_role()`. Why: authorization lives in the database, not the UI.
- Roles live in `public.user_roles`; the first account to sign up is auto-granted `admin` by a trigger. Why: bootstraps the first administrator without manual SQL.
- Hospital/doctor/treatment/post associations are join tables, edited via `syncJoin`. Why: relations must be real records, not typed text.
- Website images live in the private `media` bucket and are served by the `/media/$` server route (workspace blocks public buckets). Never store patient files there.
- Blog body is Markdown rendered by `ArticleView`, shared by the public page and admin preview so preview matches live output.
- `sitemap.xml` is generated per request from published rows only; `robots.txt` disallows `/admin` and `/auth`, and both carry `noindex`.
- Brand colours/fonts live only in `src/styles.css` tokens; brand name/contact come from the `site_settings` row.
- The shared editorial image resolver replaces only the original generated demo-image paths with CDN photographs; preserve CMS-uploaded images and label illustrative hospital photos. Why: the public refresh must not overwrite content or imply that a stock photograph depicts a listed hospital.
- tsconfig relaxes `exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature` and `noImplicitReturns`. Why: they added noise to loosely-typed CMS form code without catching real bugs.
