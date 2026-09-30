# Guía de despliegue en Railway

Objetivo: **costo mínimo, sin servicio de base de datos aparte**. SQLite vive
en el archivo `/data/app.db` dentro de un volumen montado solo en runtime.

> Regla clave: **una sola instancia**. SQLite escribe en un solo archivo; no
> escalar horizontalmente (Railway "replicas" = 1) ni añadir réplicas si se
> supera el coste. Si algún día hubiera tráfico o varias instancias, migrar a
> Postgres manteniendo todo el acceso a datos tras Prisma.

## Configuración del servicio

1. **Crear el proyecto y el servicio** apuntando al repo (framework: se
   detecta Node; build/start se ajustan abajo).
2. **Crear un volumen** en el servicio, montado en `/data`
   (Volume mount path: `/data`). Sin volumen, los datos desaparecen en cada
   deploy.
3. **Configurar las variables de entorno** (Settings → Variables):

   | Variable                                             | Valor                              |
   | ---------------------------------------------------- | ---------------------------------- |
   | `DATABASE_URL`                                       | `file:/data/app.db`                |
   | `AUTH_SECRET`                                        | secreto generado (≥ 32 caracteres) |
   | `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`              | si se usa Google                   |
   | `NEXT_PUBLIC_SITE_URL`                               | `https://tu-dominio.example`       |
   | `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | para imágenes y backups            |
   | `ADMIN_EMAIL` / `ADMIN_PASSWORD`                     | para crear el admin en el seed     |

4. **Build command** (no migraciones aquí, el volumen no existe durante el
   build):

   ```bash
   pnpm install --frozen-lockfile && pnpm build
   ```

5. **Start command** (las migraciones y el seed van aquí, con el volumen ya
   montado en runtime):

   ```bash
   pnpm prisma migrate deploy && pnpm db:seed:prod && pnpm start
   ```

6. **Replicas = 1**. En Settings desactiva cualquier autoscaling.
7. **Despliegue**: Railway genera la URL `*.up.railway.app`. Cuando lo
   verifiques, apunta tu dominio (ver `docs/cloudflare.md`).

## Comprobaciones tras el deploy

- `robots.txt` y `sitemap.xml` accesibles en el dominio final.
- Primera carga: el start command ejecuta `migrate deploy` + `db:seed:prod`
  (idempotente), así que es normal que tarde unos segundos.
- Entra en `/admin` con el correo admin del seed y revisa que una subida de
  imagen funciona (Cloudinary) o muestra el aviso de no configurado.

## Backups

Sin servicio de cron integrado, opciones en orden de más simple a más
completa (detalles en `docs/backup.md`):

- **Manual**: desde Railway, `Railway Shell` del servicio y ejecutar
  `pnpm db:backup`. La copia cae en `backups/` del contenedor y, si
  `CLOUDINARY_*` están definidas, se sube automáticamente a Cloudinary raw
  (sobrevive a los deploys).
- **Programado externo**: un job externo (p. ej. GitHub Actions, cron de
  NAS) que dispare el comando o la subida de una copia generada.
- No copiar `/data/app.db` directamente mientras la app escribe: usar
  `pnpm db:backup` (VACUUM INTO) siempre.

## Actualizaciones

- `pnpm prisma migrate dev` en local crea la migración; se commitea. En cada
  deploy, `migrate deploy` la aplica antes de `next start`.
- Tras un deploy que cambie datos públicos, la ISR (revalidate de 5 minutos)
  refresca las páginas automáticamente.

## Troubleshooting

- **Los datos "se pierden" al redeploy**: falta el volumen o `DATABASE_URL`
  no apunta a `file:/data/app.db`.
- **`migrate deploy` falla en el build**: no ejecutar migraciones en build;
  revisa que el start command sea el indicado.
- **Errores de escritura (database is locked)**: confirmar una sola réplica;
  WAL y `busy_timeout` ya están activados en `src/lib/prisma.ts`.
- **Login falla en producción**: revisar `AUTH_SECRET` y que
  `NEXT_PUBLIC_SITE_URL` sea el dominio final (no `localhost`).
