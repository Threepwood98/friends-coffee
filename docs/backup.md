# Backup y restauración de SQLite

El archivo SQLite (`prisma/dev.db` en local, `/data/app.db` en Railway) se
escribe en caliente: **nunca** copiar el archivo directamente mientras la app
corre (con WAL quedaría incoherente). Por eso existe `pnpm db:backup`, que usa
`VACUUM INTO` para generar una copia **consistente** en un solo paso.

## Crear una copia

```bash
pnpm db:backup
```

Genera:

- `backups/friends-coffee-<fecha-utc>.db` en la raíz del proyecto (carpeta
  ignorada por git). Es una instantánea consistente aunque haya escrituras
  activas.
- Si `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET`
  están definidas, además sube el archivo como **raw** a
  `friends-coffee/backups` en Cloudinary (fuera del contenedor, sobrevive a
  los deploys). Si no están definidas, avisa y sigue en local.

En Railway, ejecuta el comando desde _Railway Shell_ del servicio.

## Restaurar

> La aplicación debe estar **detenida** (es una única instancia; detener el
> servicio para restablecer). Restaurar sobre una base con escrituras activas
> corrompería los datos.

```bash
pnpm db:restore backups/friends-coffee-2026-09-30T04-16-00-037Z.db
```

Pasos que hace el script:

1. Valida que el archivo exista y tenga la cabecera de SQLite (`SQLite format
3`), para no restaurar un archivo corrupto.
2. Guarda una copia de seguridad previa de la base actual como
   `<archivo>.pre-restore-<fecha>` (por si hay que revertir).
3. Copia el snapshot sobre el archivo de `DATABASE_URL`.

## Programación automática

Railway (servicio simple) no incluye cron en el runtime:

- **Opción recomendada**: un job externo (GitHub Actions, cron NAS, etc.) que
  ejecute el comando de backup a través de Railway (p. ej. vía `Railway
Shell` mediante API) o que reciba la copia. Documenta en tu CI el horario y
  la retención.
- Alternativa mínima: backup manual con la frecuencia que marque tu política,
  siempre mediante `pnpm db:backup`.

## Buenas prácticas

- Retención: conserva copias diarias, semanales y mensuales; el script no
  borra nada automáticamente.
- **Prueba la restauración periódicamente** (ideal en el puesto/instancia de
  pruebas) sobre un `DATABASE_URL` temporal:
  `$env:DATABASE_URL="file:C:\ruta\restored.db"` en local, y
  `pnpm db:restore <snapshot>`.
- Si la copia viaja fuera de tu control (Cloudinary raw), asegúrate de que el
  bucket/cloud acepte binarios grandes y de cifrar si la política lo exige.
- Ante un fallo de esquema, restaura primero, después decide si aplicar
  `pnpm prisma migrate deploy` (solo si el snapshot pertenece a un esquema
  anterior).
