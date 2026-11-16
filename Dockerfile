# syntax=docker/dockerfile:1

FROM node:24-bookworm-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="/app/node_modules/.bin:${PNPM_HOME}:${PATH}"
ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update \
    && apt-get install --yes --no-install-recommends ca-certificates openssl \
    && rm -rf /var/lib/apt/lists/* \
    && corepack enable \
    && corepack prepare pnpm@12.4.1 --activate

WORKDIR /app

FROM base AS dependencies

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml prisma.config.ts ./
COPY prisma/schema.prisma ./prisma/schema.prisma

RUN pnpm install --frozen-lockfile

FROM base AS builder

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

ARG BETTER_AUTH_URL=http://localhost:3000
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000

ENV DATABASE_URL="file:./build.db"
ENV BETTER_AUTH_SECRET="friends-coffee-build-only-secret-not-for-runtime"
ENV BETTER_AUTH_URL="${BETTER_AUTH_URL}"
ENV NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL}"

# The Railway volume is unavailable while the image is built. This disposable
# database only provides real catalog data to Next.js prerendering.
RUN pnpm prisma migrate deploy \
    && pnpm prisma db seed \
    && pnpm build \
    && rm -f prisma/build.db prisma/build.db-journal prisma/build.db-shm prisma/build.db-wal \
    && pnpm prune --prod \
    && test -x node_modules/.bin/prisma \
    && test -x node_modules/.bin/next

FROM base AS runner

ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/src ./src
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

EXPOSE 3000

CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && ./node_modules/.bin/prisma db seed -- --require-admin && exec ./node_modules/.bin/next start"]
