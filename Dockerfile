FROM grafana/alloy:v1.16.1@sha256:51aeb9d829239345070619dad3edd6873186f913c84f45b365b74574fcb38ec0 AS alloy

FROM node:24-bookworm-slim AS deps

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates openssl \
    && rm -rf /var/lib/apt/lists/*

COPY back/package*.json ./
RUN npm ci

FROM deps AS build

COPY back/ .
RUN npx prisma generate

FROM node:24-bookworm-slim AS prod-deps

WORKDIR /app

COPY back/package*.json ./
RUN npm ci --omit=dev

FROM node:24-bookworm-slim

ENV NODE_ENV=production \
    HOME=/tmp \
    npm_config_cache=/tmp/.npm \
    PRISMA_ENGINES_CACHE_DIR=/tmp/prisma-engines
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates openssl \
    && rm -rf /var/lib/apt/lists/*

COPY --chown=node:node --from=prod-deps /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/src ./src
COPY --chown=node:node --from=build /app/prisma ./prisma
COPY --chown=node:node --from=build /app/generated ./generated
COPY --chown=node:node --from=build /app/prisma.config.ts ./prisma.config.ts
COPY --chown=node:node --from=build /app/package*.json ./
COPY --chown=node:node --chmod=755 back/docker-entrypoint.sh ./docker-entrypoint.sh
COPY --from=alloy /bin/alloy /usr/local/bin/alloy
COPY --chown=node:node ops/alloy/pipeline.alloy ops/render/source.alloy ./alloy/
COPY --chown=node:node ops/render/start-with-alloy.mjs ./start-with-alloy.mjs

USER node

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "src/server.js"]
