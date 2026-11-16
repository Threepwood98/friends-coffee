# Infraestructura Railway

`railway.ts` es la fuente de verdad de la infraestructura del entorno:

- servicio `friends-coffee` conectado a `Threepwood98/friends-coffee` (`main`);
- build mediante el `Dockerfile` del repositorio;
- una instancia en US East;
- volumen `sqlite-data` de 512 MB montado en `/data`;
- `DATABASE_URL=file:/data/app.db`;
- arranque explícito con los binarios locales de Prisma y Next, sin instalar
  dependencias en runtime;
- healthcheck en `/api/health`;
- espera de los checks de GitHub antes de cada autodeploy.

## Flujo seguro

Los cambios de `.railway/**` deben pasar por pull request:

1. `railwayapp/config` publica el plan en el PR.
2. Se revisan especialmente las operaciones destructivas.
3. Al hacer merge, el workflow aplica exactamente el plan revisado.

Un push directo a `main` no crea ni aplica un plan IaC. El primer despliegue
necesita que este flujo termine o que un operador ejecute y revise
`railway config plan` y `railway config apply` manualmente.

Para ejecutar un plan local hace falta Railway CLI:

```bash
railway login
railway link
railway config plan
```

No uses `railway config apply --yes --confirm-destructive` sin revisar antes el
plan. Omitir un recurso de esta configuración de proyecto completo puede
eliminarlo.

Los secretos se crean en Railway y aparecen como `preserve()`: nunca se
escriben en el repositorio.
