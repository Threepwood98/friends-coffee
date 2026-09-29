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
