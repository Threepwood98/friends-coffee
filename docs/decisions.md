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
- Use ESM throughout the project so every consumer, including the TypeScript seed, waits for SQLite initialization through top-level `await` before accessing the client.
- Configure SQLite once per application process with WAL mode and a 5000 ms busy timeout before exporting the shared client.
- Seed the sample catalog atomically only when there are no users, categories, or products. Any existing application data preserves catalog edits and deletions; a completely empty database is treated as uninitialized.
- Create the configured admin only when its email does not exist. Never promote an existing user or replace an existing password during startup.
- Require valid admin credentials for the production seed command and hash new admin passwords with bcrypt cost 12.
