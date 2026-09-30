# Architectural Decisions

## 2026-09-29 - Application Baseline

Status: accepted

- Use Next.js 16.3.7 with the App Router and React Server Components by default.
- Use the Next.js 16 `proxy.ts` convention instead of the deprecated `middleware.ts` convention when route protection is implemented in phase 3.
- Keep React Compiler disabled until the project has a measured need for it.
- Use the strict TypeScript configuration generated and supported by Next.js.

## 2026-09-29 - UI Foundation

Status: accepted

- Use Tailwind CSS 4 with its CSS-first configuration.
- Use the current shadcn/ui default, `base-nova`, backed by Base UI and CSS variables.
- Keep the neutral shadcn/ui tokens during setup. The project palette and typography belong to the dedicated design phase.

## 2026-09-29 - Dependency Timing

Status: accepted

- Add required packages in the phase where they are first used instead of installing the entire final stack as inactive dependencies.
- Defer Prisma, Auth.js, form, Cloudinary, animation, and test packages to their owning phases.

## 2026-09-29 - SQLite and Seed Baseline

Status: accepted

- Pin Prisma ORM and Prisma Client to 6.19.3. This preserves the required `prisma-client-js` generator, schema-based `DATABASE_URL`, and built-in SQLite connector without introducing the Prisma 7 driver-adapter stack.
- Keep the Prisma CLI, `tsx`, and `dotenv` as production dependencies because Railway runs migrations and the TypeScript seed at application startup.
- Use ESM throughout the project so the TypeScript seed can await the shared SQLite client directly.
- Configure SQLite lazily once per application process with WAL mode and a 5000 ms busy timeout. Application modules can be evaluated during `next build` without opening the runtime-only Railway volume, while every database consumer awaits `getPrisma()` before querying.
- Seed the sample catalog atomically only when there are no users, categories, or products. Any existing application data preserves catalog edits and deletions; a completely empty database is treated as uninitialized.
- Create the configured admin only when its email does not exist. Never promote an existing user or replace an existing password during startup.
- Require valid admin credentials for the production seed command and hash new admin passwords with bcrypt cost 12.

## 2026-09-29 - Authentication and Authorization

Status: accepted

- Pin Auth.js to `5.0.0-beta.32`, the current v5 release with explicit Next.js 16 support, because the project requires the v5 universal `auth()` API and `proxy.ts` integration.
- Use encrypted JWT sessions because the Credentials provider requires the JWT strategy. Continue using the Prisma adapter to persist users and Google accounts.
- Keep Proxy database-free by initializing it from a shared Auth.js config without the Prisma adapter. Proxy performs only an optimistic session check; the admin layout, pages, and every protected action use `requireUser()` or `requireAdmin()` to re-read the user and role from SQLite.
- Keep Auth.js secure cookies enabled in production and do not automatically link Google and password accounts that happen to share an email address.
- Rate-limit credential login to 5 attempts per IP/email and 20 per IP in 15 minutes. Rate-limit registration to 3 attempts per IP/email and 5 per IP per hour.
- Store at most 10,000 rate-limit counters in application memory, prune expired entries periodically, and evict the oldest entry when full. Stop evaluating narrower rules once the IP rule blocks a request. A successful login clears its IP/email counter and refunds only that successful attempt from the IP-wide counter, preserving previous failures.
- This in-memory limiter is intentionally limited to the required single Railway instance. Counters reset on restart, forwarded client-IP headers depend on the trusted Cloudflare and Railway proxy chain, and both assumptions must be revisited before horizontal scaling or direct-origin exposure.
- Treat password-account email addresses as unverified login identifiers in this phase. Email verification, password recovery, and explicit account linking require a later product decision and must not be inferred from Google ownership.
- Fail configuration when only one Google OAuth credential is present. Without both credentials, Google login remains disabled.

## 2026-09-29 - Public Menu Pages

Status: accepted

- Serve home, `/carta`, and `/carta/[slug]` as Server Components with `revalidate = 300`. Product slugs are collected at build time through `generateStaticParams`, so all available catalog pages are prerendered as static HTML and revalidated incrementally, keeping initial HTML free of client-side data fetching.
- Keep the public chrome static. The site header never calls `auth()`, because doing so would turn every public page dynamic and defeat ISR. It renders a neutral "Iniciar sesión" link; session-aware chrome is introduced in the interaction phase.
- Route public pages under a `(public)` route group so `/login`, `/registro`, and `/admin` keep their own layouts and the root layout stays generic.
- Read the catalog exclusively through `src/lib/catalog.ts` (Prisma only). Categories are ordered by `position`, products by `name` within each category; nothing is filtered at the query level so unavailable products remain visible with an "Agotado" badge and a muted price (content stays indexed for search engines).
- Placeholder images live in `public/images/placeholders/`, one SVG per seeded category plus a generic fallback. Placeholders render through `next/image` with `unoptimized` and fixed aspect ratio, so `dangerouslyAllowSVG` stays disabled; real photos from Cloudinary are then served through the optimizer once uploaded.
- Store business contact details in `src/lib/site.ts` under a single `exampleBusinessDetails` constant. Content is deliberately fictional (address, phone, hours) until the real business data is provided; the footer marks it as provisional and the JSON-LD phase must consume the same constant so data stays consistent.
- `next.config.ts` allows remote images only from `res.cloudinary.com`. No other origin is trusted for `next/image`.
