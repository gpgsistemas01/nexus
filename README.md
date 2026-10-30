# Nexus

La aplicación actual de Express, Prisma y vistas EJS vive en `back/`.
El frontend Vue 3 con TypeScript, Router y Vite está en `front/`, con login conectado
a Express usando Vuetify y VeeValidate.
Almacén, Compras, Salidas, Movimientos, Catálogos, Personas, Usuarios, Clientes y
Proveedores tienen interfaz Vue con acceso según los permisos de la cuenta.

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

Para preparar una copia por primera vez, sigue los pasos de
[Inicio rápido del sistema](front/README.md#inicio-rápido): herramientas,
dependencias, `back/.env`, base de desarrollo y cliente Prisma.

Con esa preparación completa, inicia las aplicaciones en este orden. Los comandos
siguientes se ejecutan desde la raíz, donde están `back/` y `front/`.

1. En una primera terminal, inicia la API y déjala abierta:

   ```bash
   npm --prefix back run dev
   ```

2. Abre una segunda terminal en la misma raíz, inicia Vue y déjala abierta:

   ```bash
   npm --prefix front run dev
   ```

3. Abre **http://localhost:5173/inicio-sesion** e ingresa con una cuenta habilitada
   en la base de desarrollo. Para detener el sistema, pulsa Ctrl+C en cada terminal.

La [guía detallada de inicio](front/docs/development/01-getting-started.md) explica
la configuración y los errores de dependencias, Prisma y conexión. Para trabajar
sólo con el backend, consulta [instalación y operación](back/README.md).

## Frontend Vue

El cliente contiene Almacén, Compras, Salidas, Movimientos, Catálogos, Personas,
Usuarios, Clientes y Proveedores, con acceso según permisos. Su menú enlaza las
pantallas Vue. Consulta el [README frontend](front/README.md) para los comandos y
la [arquitectura](front/docs/architecture/index.md) para la organización del código.

Desde la raíz, `npm --prefix front run build` genera `front/dist/` y
`npm --prefix front run check` ejecuta formato, ESLint, unitarias y build con tipos.
Los [procedimientos de usuario](front/docs/user-manual/index.md) y la
[publicación de manuales](front/docs/governance/05-user-manual.md) tienen sus guías
propias.

## Validación

Desde `back/`, ejecuta `npm run test:unit` y `npm run docs:check`.
La integración requiere una base aislada configurada con `DATABASE_TEST_URL`.
GitHub Actions conserva sus disparadores y ejecuta los comandos desde `back/`.

## Docker y Render

El frontend dispone de su propio [Dockerfile y comandos](front/docs/development/03-build-and-deployment.md#docker-y-vps).
Desde la raíz, `docker build -f front/Dockerfile -t nexus-front .` compila Vue
y sus reglas públicas compartidas automáticamente. Para probarlo con Express,
consulta la red y `BACKEND_UPSTREAM` en [la guía del frontend](front/docs/development/03-build-and-deployment.md#docker-y-vps).

Desde la raíz: `docker compose up --build`. El archivo local de entorno está
en `back/.env`; nunca se versiona ni se copia a la imagen.

Para el servicio Docker existente en Render conserva la rama configurada,
Root Directory vacío, Dockerfile Path `./Dockerfile` y Docker Build Context Directory
`.`. El Dockerfile copia únicamente la aplicación de `back/`. Si había comandos
personalizados o filtros de construcción, revisa sus rutas; los filtros del backend
deben incluir `back/**`, `Dockerfile` y `.dockerignore`. Los secretos siguen
configurados en Render. Este cambio no modifica la configuración remota del servicio.
