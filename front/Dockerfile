# syntax=docker/dockerfile:1
FROM node:24-bookworm-slim AS build

WORKDIR /app/front

COPY front/package.json front/package-lock.json ./
RUN --mount=type=secret,id=proxy_ca \
    if [ -f /run/secrets/proxy_ca ]; then \
      NODE_EXTRA_CA_CERTS=/run/secrets/proxy_ca npm ci; \
    else npm ci; fi

# Dockerfile.dockerignore permite sólo Vue y sus módulos públicos compartidos.
COPY front/ ./
COPY back/src/ /app/back/src/
ARG VITE_LOGIN_LOGO_URL=""
# La imagen valida la aplicación; los tipos de pruebas y herramientas se comprueban en CI.
RUN npm exec -- vue-tsc --build tsconfig.app.json && npm run build-only

FROM nginx:stable-alpine AS runtime

ENV BACKEND_UPSTREAM=http://backend:3000 \
    PORT=80 \
    NGINX_ENTRYPOINT_LOCAL_RESOLVERS=1
COPY front/nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/front/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
