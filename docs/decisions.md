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

## 2026-09-29 - Product Interactions

Status: accepted

- Keep product pages statically prerendered during the interaction phase: rating summary and comments are read by Server Components at render time, while per-user state (own rating, liked comments, user id, admin flag) is fetched after mount by a single `getMyInteractionState` server action in the client `ProductInteractions` orchestrator.
- Session-sensitive UI never relies on hidden buttons alone. Every mutation runs through a server action that calls `requireUser()` and validates input with Zod server-side; the comment deletion path also re-checks ownership or the `ADMIN` role in the database layer (`deleteProductComment` throwing `ProductCommentForbiddenError`).
- Server Core keeps the business logic bankable: `src/lib/ratings.ts`, `src/lib/comments.ts`, and `src/lib/likes.ts` accept either a `PrismaClient` or a `Prisma.TransactionClient`, so callers can replay the exact flows without HTTP.
- Likes live in a `prisma.$transaction`: the `CommentLike` row and the increment/decrement of `Comment.likeCount` change together. A like can never drive the counter below zero (`Math.max(0, likeCount - 1)`); `CommentLike` rows cascade when their comment is deleted, so no explicit cleanup is needed.
- Comments are flattened into a serializable `ProductCommentDto` (server-formatted `createdAtLabel`, resolved author name) so the client can reuse it for both SSR rendering and optimistic insertions.
- Client state is derived at render time from the hydrated server snapshot instead of being copied into effects: rating selection, the "Inicia sesión" prompts, the comment form, and like toggles read `state` once `isHydrated` flips. Likes use per-comment local overrides (liked/count) computed against the hydrated baseline, giving instant optimistic feedback without `useOptimistic`.
- Logged-out users clicking a cup or a like are redirected to `/login?callbackUrl=/carta/<slug>`. `requireUser` gained an optional `returnTo` argument for this purpose.
- Rate-limit comments to 20 per IP and 10 per IP/email in 10 minutes, and likes to 40 per IP and 20 per IP/email in 15 minutes, reusing the in-memory store from the auth phase (single Railway instance only).
- Successful interactions call `revalidatePath("/carta/<slug>")` so the next visit recomputes aggregate rating, ordering by `likeCount`/`createdAt`, and the comment list through ISR.
- Tests build an empty throwaway SQLite database per run by executing the initial migration against a PrismaClient pointed at a temporary `file:` URL (no `node:sqlite` dependency), exercising validators, rating upserts, like toggles, comment ordering, ownership enforcement, and both rate-limit rules. Vitest gained a `vitest.config.ts` resolving the `@/*` path alias.
- Ratings intentionally have no rate limit: each user can vote once (composite primary key), so the risk per account is minimal compared to comments and likes.

## 2026-09-29 - Admin Management

Status: accepted

- Protect every `/admin/**` route through the proxy and the admin layout (`await requireAdmin()`); each admin server action calls `requireAdmin()` again and validates input with Zod server-side. Admin forms render as plain server-action forms using `useActionState` and the existing Base UI primitives instead of react-hook-form, keeping the Admin phase dependency-free.
- Add a new `ProductSlugRedirect` model (`slug` unique id pointing at a product). When the slug of a product changes, the previous slug is upserted in the same `$transaction` as the update, and `/carta/[slug]` issues a permanent 301 (`redirect(..., RedirectType.permanent)`) whenever the looked-up slug resolves through this table.
- Upload product images directly from the browser to Cloudinary using an unsigned-style upload whose `timestamp`/`folder`/`allowed_formats`/`max_bytes` parameters are signed server-side (`createProductImageUploadSignature`) and validated with `validateImageUploadFile` (JPG/PNG/WebP, ≤ 3 MB) on both client and Zod-checked on the upload path. Images live in folder `friends-coffee/products`; `next/image` keeps trusting only `res.cloudinary.com`.
- Deleting a Cloudinary asset is best-effort and never blocks an admin operation. `destroyCloudinaryImage` swallows errors and the product delete/update actions derive the public id from the stored URL (`getCloudinaryPublicId`).
- Admin categorías allow editing name, slug, and position; products carry `available`, price in cents (entered in euros and transformed by Zod), category, optional image, and an auto-generated slug when left blank (`slugify` normalizes accents).
- Deleting a category that still owns products fails with a friendly P2003-based message instead of cascading; users must move or delete its products first.
- Admin lists render as responsive cards (mobile-first) with two-step delete confirmation (a `ConfirmDeleteButton` that expands into "Sí, borrar / Cancelar" and calls `router.refresh()` after success); destructive actions are never single-tap.
- Every product or category mutation revalidates home and the whole `/carta` segment (`revalidatePath("/")` + `revalidatePath("/carta", "layout")`). The `createProductAction` redirects to the products list outside the try/catch so `NEXT_REDIRECT` is never swallowed.
- Cloudinary server actions degrade gracefully when the `CLOUDINARY_*` env vars are absent: the upload signature action returns an error message and the products CRUD still works without images.

## 2026-09-29 - FRIENDS Visual Theme

Status: accepted

- The visual theme was initially inspired only abstractly by the series' apartment set (purple door, yellow peephole frame, orange couch, cream walls, coffee-brown text), without using any logo, screenshots, official typography, imagery, or verbatim quotes. The copy stays original. That "no official material" constraint was later relaxed: see `2026-09-30 – Friends lettering`.
- Typography (initial): Google `Caveat Brush` (via `next/font/google`, `display: swap`) was the `--font-heading` token for titles and product names; the existing Geist Sans stays as the readable body font. Replaced later by the Friends lettering (see below).
- The palette lives as CSS custom properties in `:root` (`--door`, `--peephole`, `--sofa`, `--cream`, `--coffee`, `--caramel`) and is mapped through `@theme inline` to Tailwind color utilities (`text-coffee`, `border-peephole`, `via-peephole`, etc.). Semantic tokens were re-derived from that palette (background = cream, foreground = coffee, primary = door purple, accent = sofa orange, secondary = caramel) so every existing component re-themes consistently; dark-mode tokens keep the same hue story.
- A shared `frame-peephole` utility draws the yellow peephole frame around product cards, category links, and the product detail image using two nested pseudo-element borders.
- The home hero pairs the headline with an inline SVG `CouchScene` (orange sofa + purple door with a yellow frame and peephole), and the site header/footer use a thin purple→yellow→orange gradient strip as the recurring identity detail.
- Entrance animation is intentional and SEO-safe: a CSS `fade-up` keyframe (opacity + translate) applied to hero/heading blocks, gated behind `prefers-reduced-motion: no-preference`, so the static HTML always contains visible text and content is never hidden under JS-dependent initial states. Framer Motion (`framer-motion@13`) is only used for real interaction: opening/closing the mobile menu with `AnimatePresence`.
- Rating cups, category pills, and "Disponible" callouts use the sofa/accent and peephole tokens instead of hardcoded amber shortcuts, keeping palette edits centralized in CSS variables.

## 2026-09-29 - Complete SEO (Phase 8)

Status: accepted

- Structured data: `src/lib/seo.ts` exports typed builders for `CafeOrCoffeeShop` (home, with NAP, `openingHoursSpecification`, `hasMenu`), `BreadcrumbList` (carta and product pages) and `Product` (offers with price in EUR decimal notation, `InStock`/`OutOfStock`). `aggregateRating` is emitted only when there is at least one real rating (`count > 0`); no rating or review is ever invented. Builders are covered by Vitest (`src/lib/seo.test.ts`).
- JSON-LD is rendered by `src/components/seo/json-ld.tsx`. It uses `dangerouslySetInnerHTML`(the only place in the codebase) because there is no other way to emit a raw `application/ld+json` node; the content is always our own `JSON.stringify` output with `<` escaped (`\u003c`), never user-controlled text, so the security rule for untrusted content keeps applying everywhere else.
- Open Graph images use `next/og` (bundled, no new dependency) with an explicit Node.js runtime - no edge runtime anywhere. Fonts in the images fall back to system stacks to avoid build-time network fetches. Both `opengraph-image.tsx` (default, brand panel) and `carta/[slug]/opengraph-image.tsx` (dynamic, with product image/name/price/rating summary) follow the file convention, so Next auto-wires og:image, twitter:image and `summary_large_image`.
- Favicon is an inline SVG (`src/app/icon.svg`) built from the same palette; `manifest.ts` and the `viewport` export set `theme-color` for light/dark (Meta theme-color + Web App Manifest).
- `sitemap.ts` lists `/`, `/carta` and available products with `lastModified`; `robots.ts` blocks `/admin`, `/api`, `/login` and `/registro` and references the sitemap. Login/registro and admin already carried `noindex, nofollow` in their layouts.
- NAP in the footer and in JSON-LD come from the same `site.ts` source of truth; footer displays address, telephone and opening hours consistently.

## 2026-09-30 - Quality and Deploy (Phase 9)

Status: accepted

- Backups: `pnpm db:backup` (`scripts/backup.ts`) runs `VACUUM INTO` through the existing Prisma client to produce a consistent snapshot under `backups/` even while the app writes, then optionally uploads it as a Cloudinary **raw** resource (`friends-coffee/backups`) when `CLOUDINARY_*` are set. No sqlite3/CLI dependency is added; the script resolves `DATABASE_URL` relative paths the same way Prisma does (against the schema directory) so `file:./dev.db` maps to `prisma/dev.db`.
- Restore: `pnpm db:restore <snapshot>` (`scripts/restore.ts`) validates the SQLite file magic header before copying, keeps a `.pre-restore-<timestamp>` safety copy of the current database, and requires the app to be stopped (SQLite single instance). It does not run migrations implicitly.
- Scripts run via `tsx` and load `.env` with `dotenv` (both already in the dependency set); `tsx` does not resolve the `@/` alias, so scripts import `../src/lib/prisma` relatively.
- E2E with Playwright is intentionally **not** added: optional per AGENTS, the interaction logic (likes/ratings) is already covered by isolated Vitest tests, and a full browser suite would add significant toolchain weight. Documented as a future option in README.
- Documentation: `README.md` (quickstart, scripts, environment, SEO, quality) plus `docs/deploy.md` (Railway volume in `/data`, migrations in the start command, one replica), `docs/cloudflare.md` (DNS proxy, SSL Full strict, no-cache exclusions, no horizontal scaling) and `docs/backup.md` (VACUUM INTO rationale, scheduling options, restore procedure). All user-facing docs are in Spanish.

## 2026-09-30 - Friends lettering

Status: accepted

- With the AGENTS "no official material" rule removed, the project adopts `GABRWFFR.TTF`, the free fan reproduction of the FRIENDS lettering ("Gabriel Weiss' FRIENDS"), as its display typeface. It is not the original logo font file — a deliberate product decision by the owner who confirmed there is no copyright concern.
- The font is self-hosted with `next/font/local` from `src/app/fonts/GABRWFFR.TTF` (`--font-friends` → `--font-heading` via the `@theme inline` token), replacing Caveat Brush; Geist Sans/Mono keep body and code, and `display: swap` preserves the CLS budget.
- Glyph remap: the original file had no Unicode cmap entry for `í ì î ï Í Ì Î Ï ñ Ñ` (present in Spanish headings like "Categorías" / "Para empezar el día"). Those glyphs do not exist in the face, so a one-off `fonteditor-core` build (installed outside the repo, not a dependency) aliases those codepoints to the nearest base letters (`i`/`n`/`I`/`N`), losing the diacritic but avoiding mixed-font fallback. Coverage re-verified against the written cmap tables.
- A `FriendsWordmark` component renders the brand name with per-letter colors cycling the palette (door purple, sofa orange, coffee, caramel). Letters are real text spans (accessible, no `aria-hidden`), it is fully static so `prefers-reduced-motion` is respected, and it has no client dependency so it also renders inside `next/og`.
- Open Graph images (default and per product) embed the remapped TTF with `readFileSync` (`src/lib/friends-font.ts`, Node runtime) and render brand/product names in the lettering; the rest of the OG copy stays on the system stack.

## 2026-09-30 - Public mobile-first redesign

Status: accepted

- Use `public/example_app.png` as structural inspiration only: compact mobile hierarchy, large rounded surfaces, prominent imagery and a persistent bottom navigation. The screenshot is not rendered, cropped or shipped as page content, and the implementation keeps the existing FRIENDS palette, lettering and original copy.
- Apply the new shell only to public and authentication routes. Shared opt-in utilities (`friends-canvas`, `friends-surface`, `friends-raised`, `friends-kicker`) avoid changing the global Base UI cards, forms or admin screens.
- Keep public catalog pages as Server Components and preserve their ISR, metadata and structured data. Only route-aware navigation and product interactions cross a client boundary; no public shell component reads the session.
- Replace the mobile drawer with a three-destination bottom navigation (`Inicio`, `Carta`, `Cuenta`) that respects the device safe area. Desktop keeps a compact sticky header. Both expose real destinations only; no search, cart, quantity or ordering controls are invented from the visual reference.
- Add `/cuenta` as a protected, dynamic page using `requireUser("/cuenta")`. It is excluded from robots and offers profile context, logout and an admin shortcut only when the persisted role is `ADMIN`.
- Authentication and 404 pages use standalone split layouts with the existing `CouchScene`, so their visual context does not require the public header or footer. Form behavior, validation, callback URLs and server actions remain unchanged.
- Keep touch targets at least 44 pixels, visible keyboard focus, semantic headings and text-based comments. Product and category placeholders are local SVGs recolored with the same centralized palette; unavailable products remain visible and indexable.

## 2026-09-30 - Menu as canonical entry point

Status: accepted

- Remove the standalone home page and make `/menu` the canonical public entry point. `/` permanently redirects to `/menu`; the former `/carta/:path*` URLs permanently redirect to `/menu/:path*` so bookmarks and indexed product links remain valid.
- Move the catalog and product route tree to `app/(public)/menu`. Canonicals, Open Graph product URLs, schema.org offers, interaction callbacks, admin links and cache revalidation all use `/menu` directly instead of relying on redirects.
- The menu page now owns the `CafeOrCoffeeShop` JSON-LD previously rendered by home. The sitemap lists only canonical `/menu` URLs and omits redirecting `/` and `/carta` entries.
- Remove the mobile bottom navigation and its safe-area padding. On mobile, the compact header exposes `Cuenta` where the location label previously appeared; the brand link opens `/menu`. Desktop navigation contains only `Menú` and `Cuenta`.
- Authentication, logout, unauthorized-admin fallback and the web app manifest use `/menu` as their safe default destination. The home-only featured-products query is removed rather than retained as dead code.

## 2026-10-01 - Cuban peso pricing

Status: accepted

- The menu reflects real prices in Cuban pesos (CUP). Prices are stored as the integer amount in pesos, exactly as they appear on the menu (`170` pesos = `price 170`, rendered `$ 170`); no cents multiplier or conversion is applied.
- `formatPrice` renders the stored integer as `$ ` followed by the number without thousands separators. Pricing is open-ended (no upper limit) and must be a whole non-negative number.
- Admin forms label the price as "CUP" (`priceCup`), schemas validate it as a non-negative integer, and JSON-LD offers use `priceCurrency: "CUP"` with the `CafeOrCoffeeShop` `priceRange` in pesos.

## 2026-10-02 - Product detail interactions and desktop width

Status: accepted

- Ratings use five stars rather than coffee-cup icons. The controls remain keyboard accessible and expose the selected value with `aria-pressed`.
- The compact product-detail composition remains the visual source of truth: image, name, price and engagement metrics, stars, description and comments. Rating and comment functionality is integrated into that flow instead of introducing separate raised panels.
- On desktop, product image and information render in two columns inside a centered `max-w-5xl` container. The menu remains centered at `max-w-6xl`; neither public view spans the full viewport width.
