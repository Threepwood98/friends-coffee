# AGENTS.md

<!-- BEGIN:nextjs-agent-rules -->

## Next.js Version Rules

This version has breaking changes: APIs, conventions, and file structure may differ from prior Next.js versions. Read the relevant guide in `node_modules/next/dist/docs/` before writing code and follow deprecation notices.

This block is written and re-added by `next dev`; keep it committed so the worktree remains clean.

<!-- END:nextjs-agent-rules -->

Reglas permanentes del proyecto. Léelas al inicio de cada sesión y respétalas siempre.

## Proyecto

Web de la carta de una cafetería, inspirada estéticamente en la serie FRIENDS. Los usuarios se registran para valorar productos, comentar y dar like a comentarios. El admin gestiona productos y categorías.

- Idioma de la interfaz y del contenido: **español**.
- Código, nombres de variables y commits: **inglés** (Conventional Commits).

## Stack (no cambiar sin preguntar)

- Next.js (App Router) + TypeScript estricto
- Tailwind CSS + shadcn/ui + Framer Motion
- Auth.js (NextAuth v5) con Prisma adapter: Google + email/contraseña (bcrypt)
- Prisma ORM + **SQLite** (archivo en volumen persistente de Railway; ver sección "Base de datos")
- Zod + react-hook-form
- Imágenes: Cloudinary (subida firmada desde el servidor)
- Gestor de paquetes: **pnpm**
- Deploy: Railway (Node normal, `next start`, **una sola instancia** con volumen). Cloudflare solo DNS/CDN delante.
- Prohibido: APIs exclusivas de Vercel, runtime edge, Postgres u otra BD externa, múltiples réplicas de la app, dependencias fuera del stack sin justificar.

## Comandos

```bash
pnpm dev            # desarrollo
pnpm lint           # ESLint
pnpm typecheck      # tsc --noEmit
pnpm build          # build de producción
pnpm test           # Vitest
pnpm prisma migrate dev      # local (DATABASE_URL=file:./dev.db)
pnpm prisma migrate deploy   # producción, en el start command
pnpm prisma db seed          # idempotente
pnpm db:backup               # copia consistente del archivo SQLite
```

Una fase no está terminada si `lint`, `typecheck` o `build` fallan.

## Modelo de datos

Fuente de verdad: `prisma/schema.prisma` con `provider = "sqlite"`. Modelos: `User` (role USER|ADMIN), `Category`, `Product`, `Rating`, `Comment`, `CommentLike`, más tablas de Auth.js.

Diferencias por usar SQLite:
- `User.role` es `String @default("USER")`, validado con Zod y un tipo TypeScript `"USER" | "ADMIN"`. No usar `enum` de Prisma.
- Índice de comentarios sin modificador de orden: `@@index([productId, likeCount, createdAt])`.
- `DATABASE_URL` es una ruta a archivo: `file:./dev.db` en local, `file:/data/app.db` en producción.

Reglas de integridad:
- `Rating`: PK compuesta `(userId, productId)`, valor entero 1–5, upsert al revotar.
- `CommentLike`: PK compuesta `(userId, commentId)`. Un like por usuario y comentario.
- `Comment.likeCount` es un contador guardado. Se actualiza **siempre** dentro de `prisma.$transaction` junto con la creación o el borrado del `CommentLike`.
- Comentarios: índice `(productId, likeCount, createdAt)`. Orden de lectura: `likeCount` descendente, empate por `createdAt` descendente.
- Precio siempre en céntimos (entero). Slug único por producto.

## Base de datos (SQLite en Railway)

Objetivo: costo mínimo, sin servicio de BD aparte.

- Un solo servicio Railway con un **volumen** montado en `/data`. El archivo vive en `/data/app.db`. Sin volumen, los datos se pierden en cada deploy.
- **Una sola instancia** de la app. SQLite escribe en un solo archivo. No escalar horizontalmente.
- Los volúmenes de Railway se montan **solo en runtime, no durante el build**. Por eso `prisma migrate deploy` y el seed van en el **start command**, nunca en el build command:
  `pnpm prisma migrate deploy && pnpm db:seed:prod && pnpm start`
- Al iniciar, ejecutar una vez `PRAGMA journal_mode=WAL;` y `PRAGMA busy_timeout=5000;` (en `lib/prisma.ts`) para mejor concurrencia lectura/escritura.
- Un único `PrismaClient` compartido (patrón singleton) para no abrir varias conexiones.
- Escrituras cortas y rápidas. Las transacciones (likes, ratings) deben ser breves.
- **Backups:** script `pnpm db:backup` que use `VACUUM INTO` (o `sqlite3 .backup`) para generar una copia consistente. No copiar el archivo `.db` directamente mientras la app escribe. Subir la copia a un almacenamiento externo (Cloudinary raw o R2) con programación periódica. Documentar restauración en `README.md`.
- Rate limiting en memoria es aceptable porque hay una sola instancia. Documentarlo.
- Si en el futuro se necesita más de una instancia o mucho tráfico, migrar a Postgres. Mantener el acceso a datos solo vía Prisma para facilitar el cambio.

## Reglas de negocio

- Sin login: ver home, carta y detalle de producto.
- Con login: votar (1–5, iconos de taza ☕), comentar (1–500 caracteres), dar like (toggle), borrar su propio comentario.
- Admin: CRUD de productos y categorías, subir imágenes, borrar cualquier comentario.
- Like sin sesión: redirigir a login.
- Like con `useOptimistic` para respuesta instantánea.

## Seguridad (crítico)

- Toda mutación pasa por Server Action o Route Handler y **valida sesión y rol en el servidor**. Ocultar botones en la UI no cuenta como seguridad.
- Helpers `requireUser()` y `requireAdmin()` en `lib/auth.ts`. Úsalos en cada acción protegida.
- `proxy.ts` protege `/admin/**`, pero cada acción de admin comprueba `role === ADMIN` por su cuenta.
- Validar toda entrada con Zod en el servidor.
- Nunca usar `dangerouslySetInnerHTML`. Comentarios se renderizan como texto.
- Rate limiting en comentarios, likes, login y registro. Documenta limitaciones si es en memoria.
- bcrypt con coste ≥ 10. Cookies seguras en producción.
- Ningún secreto en el repo. Mantener `.env.example` actualizado: `DATABASE_URL` (ej. `file:./dev.db`; en Railway `file:/data/app.db`), `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `NEXT_PUBLIC_SITE_URL`, `CLOUDINARY_*`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
- Subida de imágenes: solo admin, máx. 3 MB, jpg/png/webp.
- Errores al usuario sin detalles internos.

## SEO (requisito principal)

Todo lo siguiente es obligatorio:

1. `metadataBase` desde `NEXT_PUBLIC_SITE_URL`, `title.template`, description, canonical, Open Graph y Twitter cards. `generateMetadata` dinámico en `/carta/[slug]`.
2. `app/sitemap.ts` dinámico (home, carta, productos disponibles con `lastModified`) y `app/robots.ts` (bloquear `/admin`, `/api`, `/login`; referenciar el sitemap).
3. JSON-LD:
   - Home: `CafeOrCoffeeShop` (nombre, dirección, teléfono, horarios, `menu`).
   - Producto: `Product` con `offers`. `aggregateRating` y `review` **solo con datos reales**, nunca inventados.
   - `BreadcrumbList` en páginas internas.
4. URLs limpias con slug. Redirección 301 si cambia el slug de un producto.
5. Páginas públicas como Server Components con ISR (`revalidate`) y `revalidatePath`/`revalidateTag` al cambiar productos, ratings o comentarios. El HTML inicial debe traer nombre, descripción, precio y comentarios sin depender de JS de cliente.
6. Core Web Vitals: `next/image` con `sizes`, `priority` solo en el elemento LCP, `next/font` con `display: swap`, sin layout shift, `"use client"` solo donde haya interacción.
7. HTML semántico: un solo `<h1>` por página, jerarquía correcta, `<main>`, `<nav>`, `<article>`, `alt` descriptivo, contraste AA, foco visible, `lang="es"`, navegación por teclado.
8. `noindex` en `/login`, `/registro` y `/admin/**`.
9. Imagen OG por defecto, `opengraph-image` dinámica para productos si es viable.
10. Favicon, `manifest`, `theme-color`.
11. 404 personalizada con guiño a la serie.
12. Textos únicos por página. Datos NAP en el footer, consistentes con el JSON-LD.

Objetivo Lighthouse móvil en home y detalle: SEO, Accesibilidad y Buenas prácticas ≥ 95; Rendimiento ≥ 90.

## Diseño

- **No usar** logo, capturas, tipografía oficial ni imágenes de la serie. Solo inspiración: colores, guiños y ambiente. No citar frases textuales.
- Paleta como variables CSS/Tailwind: morado (puerta), amarillo (marco de mirilla), naranja (sofá), crema (fondo), marrón café (texto).
- Fuentes de Google Fonts: display tipo marcador (*Caveat Brush* o *Permanent Marker*) para títulos y una sans legible para texto.
- Detalles: marco amarillo tipo mirilla en tarjetas de producto, sofá naranja en SVG/CSS en el hero, ratings con tazas.
- Mobile-first. Probar 360, 768, 1024 y 1440 px. Menú hamburguesa en móvil. Tablas del admin con scroll horizontal o vista en tarjetas. Tap targets ≥ 44 px.
- Respetar `prefers-reduced-motion`.

## Estructura

```
src/
  app/
    (public)/ page.tsx, carta/page.tsx, carta/[slug]/page.tsx
    (auth)/ login/, registro/
    admin/ (productos, categorías, comentarios)
    api/auth/[...nextauth]/route.ts
    sitemap.ts, robots.ts, not-found.tsx
  components/ (ui/, product/, comments/, rating/, layout/)
  lib/ (prisma.ts, auth.ts, validators/, seo.ts, rate-limit.ts, cloudinary.ts)
  actions/ (rating.ts, comments.ts, likes.ts, products.ts, categories.ts)
prisma/ schema.prisma, seed.ts
docs/ decisions.md
```

## Fases (un commit por fase)

1. Setup: proyecto, Tailwind, shadcn/ui, ESLint/Prettier, tsconfig estricto, `.env.example`.
2. Datos: schema Prisma con `provider = "sqlite"`, migración, seed idempotente (categorías, ~10 productos, admin desde `ADMIN_EMAIL`/`ADMIN_PASSWORD`), PRAGMAs WAL y `busy_timeout`.
3. Auth: Auth.js, registro/login, roles, proxy, `requireUser()`/`requireAdmin()`.
4. Público: layout, home, carta, detalle con ISR y metadata básica.
5. Interacción: ratings, comentarios, likes con orden por likes, UI optimista, rate limiting.
6. Admin: CRUD productos y categorías, Cloudinary, moderación, revalidación.
7. Diseño FRIENDS: tema, animaciones, 404, pulido responsive.
8. SEO completo: puntos 1–12, JSON-LD, sitemap, robots, auditoría Lighthouse.
9. Calidad y deploy: tests (Vitest para validadores y lógica de likes/rating; Playwright opcional para login → rating → comentario → like), `README.md`, guía Railway (crear volumen en `/data`, `DATABASE_URL=file:/data/app.db`, migraciones en el start command, una sola réplica), script y guía de backup/restauración de SQLite, checklist Cloudflare (DNS, proxy, SSL Full strict).

Trabaja **una fase por vez**. No avances a la siguiente sin que yo lo pida.

## Reglas de trabajo

- Antes de codificar, muestra un plan breve de la fase actual y luego ejecútalo.
- Si una decisión no está definida aquí, elige la opción más simple y segura y anótala en `docs/decisions.md`.
- Sin `any` salvo justificación. Sin código muerto. Sin TODOs sin registrar.
- Al terminar cada fase, resume: qué hiciste, qué verificaste y qué queda pendiente.
- Nunca commitees `.env` ni claves.
