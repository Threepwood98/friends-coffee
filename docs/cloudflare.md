# Checklist de Cloudflare (DNS + CDN)

Cloudflare se usa **solo como DNS/CDN delante de Railway**; la app sigue en
Railway. No se usan APIs de Cloudflare Workers ni Pages.

## DNS

- [ ] Clona o crea zonas para `dominio.example` (y www como CNAME).
- [ ] Crea los registros DNS apuntando al host público de Railway
      (`*.up.railway.app`) activando **Proxy** (nube naranja) en: - `@` (apex) → CNAME a Railway (o A/AAAA si Railway lo expone). - `www` → CNAME a Railway.
- [ ] No pongas los registros como "DNS only" (nube gris) salvo durante la
      propagación inicial.

## SSL/TLS

- [ ] SSL/TLS → Overview → modo **Full (strict)**.
- [ ] Edge Certificates → **Always Use HTTPS** = ON.
- [ ] Edge Certificates → mínimo TLS 1.2 (o 1.3).
- [ ] (Opcional) HSTS = ON con `max-age=31536000` después de confirmar que
      todo HTTPS funciona.
- [ ] Sin modo "Flexible": el origen Railway ya responde por HTTPS y así se
      evitan bucles de redirección.

## Reescrituras de dominio en la app

- [ ] `NEXT_PUBLIC_SITE_URL=https://dominio.example` en Railway (base para
      canonical, OG y sitemap). Sin barra final.
- [ ] El callback OAuth de Google usa el dominio final
      (`/api/auth/callback/google`), no de `localhost`.

## Cache

- [ ] Deja que `next/image` y `/_next/static/*` (inmutables, indexados con
      hash) pasen por la caché de Cloudflare sin reglas especiales.
- [ ] Si añades una regla de caché de Cloudflare, **no cachees**:
      `/admin`, `/api/*`, `/login`, `/registro`, `robots.txt`, `sitemap.xml`
      ni los `opengraph-image` dinámicos (deben servir datos frescos).
- [ ] Tras cada deploy, purge la caché (o usa el cache-buster de hash que ya
      trae Next en `/_next/static`).

## Verificación final

- [ ] `https://dominio.example/robots.txt` y `/sitemap.xml` accesibles.
- [ ] `https://dominio.example/opengraph-image` devuelve PNG (compartir en
      redes muestra los datos NAP/menú).
- [ ] Un detalle de producto muestra su `og:image` dinámico.
- [ ] `/admin`, `/api`, `/login`, `/registro` responden `noindex`.
- [ ] La página carga con `lang="es"`, un solo `<h1>`, `theme-color` y
      favicon.
- [ ] **No escalar** detrás de Cloudflare: el origen sigue siendo una sola
      instancia (SQLite en un archivo).
