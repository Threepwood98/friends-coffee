# Café de la Esquina — Carta digital

Carta web de una cafetería con precios, disponibilidad y valoraciones, inspirada
estéticamente en la ambientación de FRIENDS (paleta de la puerta morada, la
mirilla, el sofá) **sin usar logos, capturas, tipografía ni citas de la serie**:
solo colores, guiños y ambiente.

La interfaz y todo el contenido están en **español**. El código, los nombres de
variables y los commits están en inglés (Conventional Commits).

## Funcionalidades

- Sin login: ver la home, la carta y el detalle de cada producto (con ISR).
- Con login (Google o email/contraseña): valorar con tazas ☕ (1–5), comentar,
  dar like a comentarios (toggle) y borrar el propio comentario.
- Admin: CRUD de categorías y productos, subida de imágenes (Cloudinary) y
  moderación de comentarios.
- SEO completo: metadata, `sitemap.xml`, `robots.txt`, JSON-LD
  (`CafeOrCoffeeShop`, `Product`, `BreadcrumbList`), imágenes OG propias,
  favicon SVG y manifest.

## Stack

Next.js (App Router) · TypeScript estricto · Tailwind CSS + shadcn/ui +
Framer Motion · Auth.js (NextAuth v5, Google + credentials con bcrypt) ·
Prisma ORM + SQLite · Zod + react-hook-form · Cloudinary · Vitest · pnpm.

> Prohibido por convención: APIs exclusivas de Vercel, runtime edge, Postgres
> u otra base externa, múltiples réplicas de la app. Ver `AGENTS.md`.

## Estructura

```
src/
  app/            páginas y rutas (public, auth, admin, api, manifest, sitemap…)
  components/     ui/, product/, comments/, rating/, layout/, seo/
  lib/            prisma, auth, validators, catálogo, seo, cloudinary, rate-limit…
  actions/        server actions de rating, comentarios, likes, productos, categorías
prisma/           schema.prisma y semillas
scripts/          db:backup y db:restore (SQLite)
docs/             decisiones y guías (deploy, cloudflare, backup)
```

## Puesta en marcha local

Requisitos: Node.js ≥ 20 y pnpm.

```bash
pnpm install
cp .env.example .env        # rellena los valores (ver sección Variables)
pnpm prisma migrate dev     # crea prisma/dev.db y aplica migraciones
pnpm prisma db seed         # categorías, ~10 productos y admin
pnpm dev                    # http://localhost:3000
```

Después de tocar `prisma/schema.prisma`:

```bash
pnpm prisma migrate dev --name "nombre-de-la-migracion"
```

### Variables de entorno (`*.env`)

| Variable                                             | Ejemplo                 | Notas                                   |
| ---------------------------------------------------- | ----------------------- | --------------------------------------- |
| `DATABASE_URL`                                       | `file:./dev.db`         | En Railway: `file:/data/app.db`         |
| `AUTH_SECRET`                                        | (32+ chars)             | `pnpm dlx auth secret`                  |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`              |                         | Callback: `/api/auth/callback/google`   |
| `NEXT_PUBLIC_SITE_URL`                               | `http://localhost:3000` | Base para canonical, OG y sitemap       |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` |                         | Opcional para subir imágenes y backups  |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD`                     |                         | Credenciales del admin que crea el seed |

Nunca se commitea `.env`. `.env.example` es la fuente de referencia.

## Comandos

| Comando                        | Descripción                          |
| ------------------------------ | ------------------------------------ |
| `pnpm dev`                     | Desarrollo                           |
| `pnpm lint`                    | ESLint                               |
| `pnpm typecheck`               | `tsc --noEmit`                       |
| `pnpm build`                   | Build de producción                  |
| `pnpm test`                    | Vitest                               |
| `pnpm prisma migrate dev`      | Migración local                      |
| `pnpm prisma migrate deploy`   | Migración en producción (ver deploy) |
| `pnpm prisma db seed`          | Semilla idempotente                  |
| `pnpm db:backup`               | Copia consistente de SQLite          |
| `pnpm db:restore <archivo.db>` | Restaura un snapshot                 |

## Base de datos (SQLite)

- Un único `PrismaClient` compartido (patrón singleton) con `PRAGMA
journal_mode=WAL` y `busy_timeout=5000` (`src/lib/prisma.ts`).
- Se sirve desde **una sola instancia**: SQLite escribe en un solo archivo, no
  escalar horizontalmente ni usar varias réplicas.
- En local el archivo vive en `prisma/dev.db`; en Railway, en el volumen
  montado en `/data/app.db`.
- El rate limiting es **en memoria** (aceptable con una sola instancia);
  si algún día se escala a varias réplicas, migrar a Postgres.

### Copias de seguridad

`pnpm db:backup` genera una copia **consistente** con `VACUUM INTO` en
`backups/friends-coffee-<fecha>.db` (segura aunque la app esté escribiendo) y,
si `CLOUDINARY_*` están configuradas, la sube como raw a Cloudinary.
Documentación completa y guía de programación: `docs/backup.md`.

Restauración (requiere detener la app):

```bash
pnpm db:restore backups/friends-coffee-2026-09-30T04-16-00-037Z.db
```

## Despliegue y CDN

- **Railway**: guía paso a paso en `docs/deploy.md` (volumen en `/data`,
  migraciones en el start command, una sola réplica).
- **Cloudflare**: checklist de DNS, proxy y SSL en `docs/cloudflare.md`.

## SEO

Objetivo Lighthouse móvil (home y detalle): SEO, Accesibilidad y Buenas
prácticas ≥ 95; Rendimiento ≥ 90. Resumen implementado:

- `metadataBase`, template de títulos, descripciones, canonical, Open Graph y
  Twitter cards (`summary_large_image`), con `generateMetadata` dinámico en
  `/carta/[slug]`.
- `app/sitemap.ts` (home, carta y productos disponibles con `lastModified`) y
  `app/robots.ts` (bloquea `/admin`, `/api`, `/login`, `/registro`).
- JSON-LD: `CafeOrCoffeeShop` (home, con NAP y horarios), `Product` con
  `offers` y `aggregateRating` **solo con valoraciones reales**,
  `BreadcrumbList` en internas.
- Redirección 301 si cambia el slug de un producto; ISR con `revalidate` y
  `revalidatePath`; el HTML trae nombre, descripción, precio y comentarios
  sin depender de JS de cliente.
- Imágenes OG: por defecto (`/opengraph-image`) y dinámicas por producto.
- Favicon SVG, `manifest`, `theme-color`, 404 con guiño a la serie, NAP
  consistente en footer y JSON-LD.

## Tests y calidad

- Vitest cubre: validadores de auth, admin, interacciones, lógica de
  likes/ratings, Cloudinary (firma y política de subida) y builders de SEO.
- Playwright (e2e) queda **fuera del alcance** actual; los pasos de flujo
  (login → rating → comentario → like) están cubiertos por la lógica aislada.
  Si se añade, usar `webServer` con `next start` + `prisma migrate deploy` +
  seed.
- Regla del proyecto: una fase no está terminada si `lint`, `typecheck` o
  `build` fallan.

## Decisiones

Las decisiones de diseño y arquitectura se registran en `docs/decisions.md`.
