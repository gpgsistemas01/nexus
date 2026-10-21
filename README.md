# Nexus

La aplicación actual de Express, Prisma y vistas EJS vive en `back/`.
El frontend Vue 3 con TypeScript, Router y Vite está en `front/`, con login conectado
a Express usando Vuetify y VeeValidate para la migración gradual.
Las pantallas operativas actuales siguen renderizándose con EJS en el backend.

```text
back/                 # Express, EJS, Prisma, pruebas y documentación
front/                # Vue 3 + Vite, login y laboratorio visual
.github/workflows/    # CI del repositorio
Dockerfile            # Construye el backend usando el contexto raíz
docker-compose.yml    # Ejecuta el backend con back/.env
```

## Directorio de ejecución de comandos

| Operación | Desde dónde ejecutarla |
| --- | --- |
| npm del backend, Prisma (`npx prisma`) y scripts Node | `back/` |
| npm del frontend (dev, build, preview) | `front/` |
| Docker Compose y construcción con Dockerfile | Raíz del repositorio |
| Git (commit, pull y push) | Preferentemente raíz del repositorio |

Desde la raíz, puedes entrar al backend con `cd back` y ejecutar, por ejemplo,
`npm run test:unit`. Para volver a la raíz usa `cd ..`.
Como alternativa, sin cambiar de carpeta, usa `npm --prefix back run test:unit`,
`npm --prefix back run docs:check` o `npm --prefix back ci`.
Los ejemplos `npx prisma ...` y `node scripts/...` requieren estar dentro de `back/`.
Los archivos `.env`, las salidas y las rutas relativas del backend se resuelven allí.
Dentro del contenedor Docker, la aplicación está en `/app`; no se usa `/app/back`.

## Desarrollo

```bash
cd back
npm ci
npm run db:generate
npm run dev
```

Consulta [instalación y operación](back/README.md) y el
[índice de documentación](back/docs/README.md). Las rutas técnicas de esa documentación
son relativas a `back/`.

## Frontend Vue

Abre `/inicio-sesion` en el puerto 5173 para usar el login Vue con Express ejecutándose
en el puerto 3000. Al autenticar se abre materiales EJS. `/inicio` conserva el
comparador de **MDB Vue**, **Vuetify** y **PrimeVue**, una demostración sin autenticación.
Si tienes una copia anterior, actualiza `features`, instala con `npm ci` en `front/`
y reinicia Vite. La plantilla del contador se conserva en `/ejemplo`.

Usa Node.js 24.14.1+ de la rama 24 o 22.13+ de la rama 22 para el frontend.

En otra terminal, desde la raíz del repositorio:

```bash
cd front
npm ci
npm run dev
```

Para compilar: `npm run build` desde `front/`, o `npm --prefix front run build` desde
la raíz. La salida queda en `front/dist/`. Consulta [la guía del frontend](front/README.md).
El login integra la API mediante un proxy; los demás módulos conservan sus pantallas EJS.
Consulta [configuración y alcance del login](front/docs/login.md).
Desde la raíz, `npm --prefix front run check` ejecuta ESLint, pruebas y build con tipos.
En VS Code instala las extensiones recomendadas Vue - Official y ESLint; para
comprobar tipos continuamente usa `npm --prefix front run type-check:watch`.

## Validación

Desde `back/`, ejecuta `npm run test:unit` y `npm run docs:check`.
La integración requiere una base aislada configurada con `DATABASE_TEST_URL`.
GitHub Actions conserva sus disparadores y ejecuta los comandos desde `back/`.

## Docker y Render

El frontend dispone de su propio [Dockerfile y comandos](front/README.md#docker-para-vps-o-pruebas-locales).
Desde la raíz, `docker build -f front/Dockerfile -t nexus-front .` compila Vue
y sus reglas públicas compartidas automáticamente. Para probarlo con Express,
consulta la red y `BACKEND_UPSTREAM` en [la guía del frontend](front/docs/login.md).

Desde la raíz: `docker compose up --build`. El archivo local de entorno está
en `back/.env`; nunca se versiona ni se copia a la imagen.

Para el servicio Docker existente en Render conserva la rama configurada,
Root Directory vacío, Dockerfile Path `./Dockerfile` y Docker Build Context Directory
`.`. El Dockerfile copia únicamente la aplicación de `back/`. Si había comandos
personalizados o filtros de construcción, revisa sus rutas; los filtros del backend
deben incluir `back/**`, `Dockerfile` y `.dockerignore`. Los secretos siguen
configurados en Render. Este cambio no modifica la configuración remota del servicio.
