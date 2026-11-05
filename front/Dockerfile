# syntax=docker/dockerfile:1
FROM node:24-bookworm-slim AS build

WORKDIR /app/front

COPY front/package.json front/package-lock.json ./
RUN --mount=type=secret,id=proxy_ca \
    if [ -f /run/secrets/proxy_ca ]; then \
      NODE_EXTRA_CA_CERTS=/run/secrets/proxy_ca npm ci; \
    else npm ci; fi

COPY front/index.html front/vite.config.ts front/vitest.config.ts front/playwright.config.ts front/env.d.ts front/tsconfig*.json ./
COPY front/public ./public
COPY front/src ./src
# Sólo módulos públicos compartidos; no se copia el código privado de Express.
COPY back/src/public/js/utils/validations/loginValidation.js back/src/public/js/utils/validations/baseValidations.js back/src/public/js/utils/validations/validators.js back/src/public/js/utils/validations/fieldValidations.js /app/back/src/public/js/utils/validations/
COPY back/src/public/js/utils/timeZone.js /app/back/src/public/js/utils/
COPY back/src/public/js/constants/apiMessages.js /app/back/src/public/js/constants/
COPY back/src/shared/constants/apiSuccessCodes.js back/src/shared/constants/catalogs.js back/src/shared/constants/auth.js back/src/shared/constants/inputValidation.js back/src/shared/constants/inventory.js back/src/shared/constants/permissions.js /app/back/src/shared/constants/
COPY back/src/shared/messages/goodsReceiptMessages.js /app/back/src/shared/messages/
COPY back/src/shared/inventory/wasteMeasurements.js back/src/shared/inventory/goodsReceiptCalculations.js /app/back/src/shared/inventory/
COPY back/src/shared/validation/weightValidations.js /app/back/src/shared/validation/
COPY back/src/shared/utils/numberUtils.js /app/back/src/shared/utils/
COPY back/src/public/js/application/warehouse/issues/issueHeaderRules.js /app/back/src/public/js/application/warehouse/issues/
COPY back/src/public/js/utils/formatters.js /app/back/src/public/js/utils/
COPY back/src/public/js/constants/fulfillmentStatuses.js /app/back/src/public/js/constants/
ARG VITE_LOGIN_LOGO_URL=""
RUN npm run build

FROM nginx:stable-alpine AS runtime

ENV BACKEND_UPSTREAM=http://backend:3000
COPY front/nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/front/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
