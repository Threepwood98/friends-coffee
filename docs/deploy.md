# Despliegue automatizado en Railway

La producción usa un único servicio Railway, una imagen construida desde el
`Dockerfile` del repositorio y una base SQLite en `/data/app.db`. La
infraestructura está declarada en `.railway/railway.ts`.

> **Una sola instancia:** el volumen solo se puede montar en un despliegue a la
> vez y SQLite escribe en un único archivo. No añadas réplicas ni autoscaling.

## Arquitectura

- Repositorio: `Threepwood98/friends-coffee`, rama `main`.
- Builder: Dockerfile multi-stage con Node.js 24 y pnpm 12.
- Servicio: `friends-coffee`, una réplica en US East.
- Volumen: `sqlite-data`, 512 MB, montado en `/data`.
- Base persistente: `DATABASE_URL=file:/data/app.db`.
- Arranque:

  ```bash
  ./node_modules/.bin/prisma migrate deploy &&
    ./node_modules/.bin/prisma db seed -- --require-admin &&
    ./node_modules/.bin/next start
  ```

- El arranque usa exclusivamente las dependencias fijadas dentro de la imagen;
  nunca ejecuta `pnpm install` en runtime.
- Readiness: `GET /api/health`, con una consulta real a SQLite.
- Despliegue: automático después de que los checks de GitHub terminen
  correctamente.

Un servicio con volumen no puede solapar dos despliegues. Habrá un pequeño
periodo de indisponibilidad mientras Railway desmonta la versión anterior y
monta `/data` en la nueva; el healthcheck evita activar una versión que no esté
lista, pero no elimina esa limitación.

## Bootstrap único

El proyecto Railway ya debe existir con el servicio original
`friends-coffee`. IaC adopta ese recurso por nombre en lugar de reemplazarlo.

### 1. Conectar GitHub

Instala o autoriza la aplicación de Railway en GitHub y dale acceso a
`Threepwood98/friends-coffee`.

### 2. Preparar el servicio

En el entorno `production`:

1. Confirma que el servicio existente se llama exactamente `friends-coffee` y
   está conectado a `Threepwood98/friends-coffee`.
2. En **Settings → Networking**, genera un dominio Railway
   `*.up.railway.app`.
3. No crees el volumen manualmente: Railway IaC creará `sqlite-data` y lo
   montará en `/data`.

Si Railway no permite generar el dominio hasta conectar una fuente, aplica
primero IaC, genera el dominio después y fuerza un redeploy de la última
revisión.

### 3. Configurar variables

Añade estas variables al servicio `friends-coffee` antes del primer despliegue:

| Variable                                    | Obligatoria | Valor                                           |
| ------------------------------------------- | ----------- | ----------------------------------------------- |
| `BETTER_AUTH_SECRET`                        | Sí          | Secreto criptográfico de al menos 32 caracteres |
| `ADMIN_EMAIL`                               | Sí          | Correo inicial del administrador                |
| `ADMIN_PASSWORD`                            | Sí          | Contraseña inicial de 8–128 caracteres          |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | No          | Ambas juntas si se habilita Google              |
| `CLOUDINARY_CLOUD_NAME`                     | No          | Junto con las otras dos variables de Cloudinary |
| `CLOUDINARY_API_KEY`                        | No          | Clave de Cloudinary                             |
| `CLOUDINARY_API_SECRET`                     | No          | Secreto de Cloudinary                           |

Genera el secreto de Better Auth con:

```bash
pnpm dlx auth@latest secret
```

Después de comprobar los valores, sella `BETTER_AUTH_SECRET`,
`ADMIN_PASSWORD`, `GOOGLE_CLIENT_SECRET` y `CLOUDINARY_API_SECRET` desde
Railway.

IaC administra estas variables; no las dupliques manualmente:

| Variable               | Valor administrado                     |
| ---------------------- | -------------------------------------- |
| `DATABASE_URL`         | `file:/data/app.db`                    |
| `BETTER_AUTH_URL`      | `https://${{ RAILWAY_PUBLIC_DOMAIN }}` |
| `NEXT_PUBLIC_SITE_URL` | `https://${{ RAILWAY_PUBLIC_DOMAIN }}` |

El callback de Google será:

```text
https://<dominio-railway>/api/auth/callback/google
```

### 4. Autorizar el workflow IaC

1. Crea un **Project Token** de Railway limitado al entorno `production`.
2. En GitHub abre **Settings → Secrets and variables → Actions**.
3. Crea el secreto `RAILWAY_TOKEN` con ese token.

El token pertenece al workflow, no a la aplicación. Nunca se añade a
`.env.example` ni al servicio.

### 5. Aplicar la infraestructura

Los cambios de `.railway/**` deben entrar mediante pull request:

1. `.github/workflows/railway-config.yml` ejecuta `railway config plan`.
2. El bot publica en el PR los recursos que creará o modificará.
3. Revisa especialmente cualquier operación marcada como destructiva.
4. Al hacer merge, el workflow aplica exactamente el plan revisado.

La configuración crea el volumen, conecta el repositorio, selecciona el
Dockerfile, fija el start command y activa la espera de checks de GitHub
(`checkSuites`).

Un push directo a `main` no ejecuta este workflow y no aplica IaC. En el
bootstrap inicial, no despliegues la aplicación hasta que el plan del PR se
haya aplicado o hasta completar manualmente el plan y apply siguientes.

También se puede hacer el primer apply localmente:

```bash
railway login
railway link
railway config plan
railway config apply
```

No ejecutes un apply destructivo sin revisar primero el plan.

## Flujo de cada despliegue

1. Un push a `main` inicia CI y el autodeploy de Railway.
2. Railway mantiene el despliegue en espera.
3. CI ejecuta formato, lint, tipos, los tests, un `docker build` real y arranca
   la imagen con una SQLite temporal para comprobar `/api/health`.
4. Si CI falla, Railway omite el despliegue.
5. Si CI pasa, Railway construye la imagen.
6. Al arrancar el contenedor, con `/data` ya montado:
   - aplica las migraciones pendientes;
   - ejecuta el seed idempotente y exige las credenciales del admin;
   - inicia `next start` usando el `PORT` inyectado por Railway.
7. Railway consulta `/api/health`; solo un `2xx` activa la versión.

## Base SQLite usada durante el build

`next build` prerenderiza `/menu` y `sitemap.xml`, por lo que necesita un
esquema y catálogo válidos. El volumen Railway no existe durante el build.

La etapa `builder` del Dockerfile:

1. fija `DATABASE_URL=file:./build.db`;
2. aplica las migraciones a `prisma/build.db`;
3. ejecuta el seed sin `--require-admin`;
4. construye Next.js;
5. elimina la base y sus archivos WAL antes de ensamblar la imagen final.

Esa base es descartable, nunca toca `/data` y no recibe las credenciales del
admin. El builder usa un secreto ficticio de Better Auth. Los únicos valores
Railway aceptados como `ARG` son `BETTER_AUTH_URL` y
`NEXT_PUBLIC_SITE_URL`, que son URL públicas.

## Healthcheck

`GET /api/health`:

- usa runtime Node.js;
- espera la inicialización de Prisma y sus PRAGMAs;
- ejecuta `SELECT 1`;
- responde `200 {"status":"ok"}` o
  `503 {"status":"unavailable"}`;
- usa `Cache-Control: no-store`;
- nunca devuelve detalles internos.

Railway utiliza este endpoint durante el despliegue. No sustituye un monitor de
disponibilidad continuo.

## Verificaciones posteriores

- `/api/health` devuelve `200`.
- `/menu`, `/robots.txt` y `/sitemap.xml` usan el dominio público final.
- El login por contraseña funciona con el admin sembrado.
- Si Google está configurado, su callback coincide exactamente con el dominio.
- Una edición del catálogo sobrevive a un redeploy.
- Una subida de imagen funciona o muestra correctamente que Cloudinary no está
  configurado.
- El servicio muestra una sola réplica y el volumen aparece montado en `/data`.

## Backups y migraciones

Antes de una migración destructiva:

```bash
pnpm db:backup
```

El comando usa `VACUUM INTO`; no copies `/data/app.db` directamente mientras la
aplicación escribe. Consulta `docs/backup.md` para programación y restauración.

Una reversión de imagen no revierte automáticamente el esquema. Restaura un
snapshot solo con el servicio detenido.

La migración histórica a Better Auth invalidó las sesiones anteriores y
eliminó los usuarios e interacciones del esquema Auth.js. Si se despliega sobre
una base anterior a esa migración, crea y verifica primero un backup externo.

## Troubleshooting

- **El build no encuentra tablas:** confirma que Railway detecta `Dockerfile` y
  que la etapa `builder` ejecuta migraciones sobre `file:./build.db`.
- **Prisma muestra `P1012` y falta `DATABASE_URL`:** IaC todavía no se aplicó o
  la variable se eliminó del servicio. Confirma el plan, el volumen `/data` y
  `DATABASE_URL=file:/data/app.db`; después fuerza un rebuild completo.
- **El contenedor intenta instalar o actualizar paquetes al arrancar:** elimina
  cualquier Start Command manual del panel y vuelve a aplicar IaC. El comando
  administrado ejecuta `node_modules/.bin/*` y no debe mostrar una resolución
  de dependencias pnpm.
- **Los datos desaparecen:** verifica el volumen en `/data` y
  `DATABASE_URL=file:/data/app.db`.
- **`db:seed:prod` falla:** revisa `ADMIN_EMAIL` y `ADMIN_PASSWORD`; ambas son
  obligatorias y deben ser válidas.
- **Healthcheck 503:** revisa primero los logs de migración/seed y después los
  permisos y montaje del volumen.
- **`database is locked`:** confirma una sola réplica. WAL y
  `busy_timeout=5000` ya se configuran en `src/lib/prisma.ts`.
- **Login o canonical apuntan a localhost:** genera el dominio Railway y fuerza
  un nuevo build para que `NEXT_PUBLIC_SITE_URL` se vuelva a incrustar.
- **El workflow IaC no se ejecuta:** comprueba el secreto `RAILWAY_TOKEN`, el
  acceso de Railway GitHub App y que el PR modifica `.railway/**`.
