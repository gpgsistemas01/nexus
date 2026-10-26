# Nexus

La aplicación actual de Express, Prisma y vistas EJS vive en `back/`.
El frontend Vue 3 con TypeScript, Router y Vite está en `front/`, con login conectado
a Express usando Vuetify y VeeValidate para la migración gradual.
Materiales, Consumibles, Mermas, Movimientos, Catálogos, Personas, Usuarios, Clientes
y Proveedores ya tienen interfaz Vue; las demás pantallas
operativas permanecen en el backend y no se enlazan desde el menú de Vue.

```text
back/                 # Express, EJS, Prisma, pruebas y documentación
front/                # Vue 3 + Vite, login, Almacén, Movimientos, Identidad y Directorio
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

## Archivos locales ignorados y cambio de estructura

> **Al actualizar una copia anterior a la separación en `back/` y `front/`, Git
> no traslada los archivos locales ignorados ni instala dependencias.** Un
> `git pull` puede actualizar el código mientras `.env`, `node_modules/` o el
> cliente Prisma anterior permanecen en la raíz.

Las rutas siguientes son relativas a la raíz del repositorio:

| Archivo o carpeta local | Ubicación actual | Cómo se prepara |
| --- | --- | --- |
| Variables y secretos de Express/PostgreSQL | `back/.env` | Trasladar el `.env` anterior conservando sus valores. Si ya existe el destino, comparar y combinar sin sobrescribirlo a ciegas. |
| Configuración opcional de Vite | `front/.env.local` | Crear a partir de `front/.env.example`. No copiar los secretos del backend; las variables `VITE_*` se publican en el navegador. |
| Dependencias de Express y herramientas del backend | `back/node_modules/` | Ejecutar `npm --prefix back ci`. |
| Dependencias de Vue y herramientas del frontend | `front/node_modules/` | Ejecutar `npm --prefix front ci --include=dev`. |
| Cliente generado de Prisma | `back/generated/prisma/` | Ejecutar `npm --prefix back run db:generate`; no se descarga con Git. |
| Compilación y cachés de Vue/Vite/TypeScript | `front/dist/`, `front/node_modules/.vite/`, `front/node_modules/.tmp/` | Se regeneran con los comandos del frontend. |
| Exportaciones y resultados de pruebas | `back/build/`, `front/build/` | Los generan las herramientas del módulo correspondiente. |

Detén los servidores antes de reinstalar. Después de colocar `back/.env`, ejecuta
desde la raíz:

```bash
npm --prefix back ci
npm --prefix front ci --include=dev
npm --prefix back run db:generate
```

Cada aplicación tiene sus propias dependencias. No muevas `node_modules/` a mano:
tras completar las instalaciones puedes eliminar el `node_modules/` antiguo de
la raíz. Conserva la configuración y los datos locales; no uses una limpieza
global de archivos ignorados para resolver errores de instalación.

Los archivos de dependencias como `jsx-runtime.d.ts` dentro de `node_modules/`
los administra npm: no se editan ni se versionan. Los `package.json` y
`package-lock.json` de ambas aplicaciones y `front/.env.example` sí se versionan.
`.gitignore` determina lo que Git ignora; `.dockerignore` controla el contexto de
Docker y no sustituye la configuración local.

Para comprobar qué regla ignora un archivo sin mostrar su contenido:

```bash
git check-ignore -v back/.env front/.env.local back/node_modules front/node_modules back/generated/prisma/client.ts
```

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
en el puerto 3000. Al autenticar se abre Almacén en Vue según los permisos.
Si tienes una copia anterior, actualiza `features`, instala con `npm ci` en `front/`
y reinicia Vite.
Si el arranque indica que no puede resolver `vee-validate`, consulta la
[recuperación de dependencias del frontend](front/README.md#dependencias-no-resueltas-en-vite).

Para trabajar con ambas aplicaciones, usa Node.js 24.15.0+ de la rama 24,
22.22.2+ de la rama 22 o 26.12.1+ de la rama 26. CI comprueba las ramas 24 y 26 en ambas aplicaciones. Los
Dockerfiles conservan sus versiones propias: Node 22 en Express y Node 24 para
compilar Vue; cambiar Node en tu equipo no actualiza producción.

En otra terminal, desde la raíz del repositorio:

```bash
cd front
npm ci
npm run dev
```

Para compilar: `npm run build` desde `front/`, o `npm --prefix front run build` desde
la raíz. La salida queda en `front/dist/`. Consulta [la guía del frontend](front/README.md).
El login, Almacén (Materiales, Consumibles y Mermas), Compras, Salidas, Movimientos y los seis
Catálogos integran la API mediante un proxy del mismo origen. El menú sólo contempla vistas Vue; los demás módulos
conservan sus pantallas EJS en el backend.
Para preparar una copia completa y arrancar Vue y Express, consulta
[inicio del proyecto](front/docs/development/01-getting-started.md).
Consulta [configuración del login](front/docs/modules/01-authentication.md),
[operaciones y arquitectura de Almacén](front/docs/modules/02-warehouse.md),
[Compras](front/docs/modules/06-purchases.md), [Salidas](front/docs/modules/07-issues.md),
[Catálogos](front/docs/modules/03-catalogs.md) y [Movimientos](front/docs/modules/05-movements.md).
Desde la raíz, `npm --prefix front run check` ejecuta formato, ESLint, pruebas y build con tipos.
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
consulta la red y `BACKEND_UPSTREAM` en [la guía del frontend](front/docs/modules/01-authentication.md).

Desde la raíz: `docker compose up --build`. El archivo local de entorno está
en `back/.env`; nunca se versiona ni se copia a la imagen.

Para el servicio Docker existente en Render conserva la rama configurada,
Root Directory vacío, Dockerfile Path `./Dockerfile` y Docker Build Context Directory
`.`. El Dockerfile copia únicamente la aplicación de `back/`. Si había comandos
personalizados o filtros de construcción, revisa sus rutas; los filtros del backend
deben incluir `back/**`, `Dockerfile` y `.dockerignore`. Los secretos siguen
configurados en Render. Este cambio no modifica la configuración remota del servicio.
