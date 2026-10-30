# 1. Preparar e iniciar el proyecto Vue

Los comandos se ejecutan desde la **raíz del repositorio**, que contiene `front/`
y `back/`, usando `--prefix`. Necesitas Git, npm, PostgreSQL y una versión de Node
admitida por los manifiestos de [front](../../package.json) y
[back](../../../back/package.json). Para ingresar necesitas una cuenta activa en
la base del entorno.

## 1. Comprobar la copia y Node

Si aún no tienes una copia:

```bash
git clone --branch features https://github.com/gpgsistemas01/nexus.git
cd nexus
```

Si ya existe, abre su raíz y comprueba las herramientas:

```bash
git status --short
node --version
npm --version
```

Conserva el repositorio completo: los alias `@nexus/*` incorporan módulos públicos
de `back/` al compilar Vue.

## 2. Instalar dependencias de cada aplicación

```bash
npm --prefix back ci --include=dev
npm --prefix front ci --include=dev
```

Espera a que ambos comandos terminen correctamente. Cada uno instala su propio
`node_modules` usando el lockfile. Repítelos cuando descargues cambios de dependencias.

## 3. Preparar los archivos locales

### Configuración mínima de la API de desarrollo

Crea **`back/.env`**, junto a `back/package.json`. Si ya está configurado, conserva
sus valores. Sustituye los datos de ejemplo por la conexión de tu base de desarrollo
y tres secretos distintos:

```dotenv
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://usuario_local:clave_local@127.0.0.1:5432/nexus_dev"
JWT_SECRET_ACCESS="reemplazar-por-secreto-local-independiente"
JWT_SECRET_REFRESH="reemplazar-por-otro-secreto-local-independiente"
JWT_SECRET_ONE_TIME="reemplazar-por-otro-secreto-local-independiente"
```

La base y su cuenta PostgreSQL deben existir. Si la migración requiere conexión
directa, agrega `DIRECT_URL` para esa misma base. Las variables y los secretos de
la API se quedan en este archivo; las variables `VITE_*` se publican en el navegador.
Las conexiones de pruebas se preparan por separado según la
[guía de sistema](../testing/05-system-tests.md).

### Configurar `front/.env.local` para Vue

Este archivo es opcional con la API en `http://127.0.0.1:3000` y el logo predeterminado.
Para personalizarlo, copia la plantilla **sólo si todavía no existe**.

En PowerShell:

```powershell
if (-not (Test-Path front/.env.local)) {
    Copy-Item front/.env.example front/.env.local
}
```

En Bash:

```bash
if [ ! -e front/.env.local ]; then
    cp front/.env.example front/.env.local
fi
```

La copia queda junto a `front/package.json`. Abre `front/.env.local` en el editor:

```dotenv
BACKEND_PROXY_TARGET=http://127.0.0.1:3000
VITE_LOGIN_LOGO_URL=
```

| Variable | Valor y aplicación |
| --- | --- |
| `BACKEND_PROXY_TARGET` | Origen de la API, sin `/api` ni credenciales. Destino del proxy para API y cierre de sesión. |
| `VITE_LOGIN_LOGO_URL` | Público. Vacío muestra N; `/logo.png` usa `front/public/logo.png`. Admite URL pública. |

Si la API escucha en 3001:

```dotenv
BACKEND_PROXY_TARGET=http://127.0.0.1:3001
```

Guarda el archivo y reinicia Vite. Este valor no cambia el `PORT` de la API ni el
puerto de Vue; sigue abriendo las páginas desde `http://localhost:5173`.
Modificar sólo `.env.example` no cambia la configuración activa.

Vite aplica, de menor a mayor prioridad: `.env`, `.env.local`, `.env.[modo]` y
`.env.[modo].local`. Las variables del proceso tienen prioridad sobre esos archivos.
Los valores `VITE_*` de una compilación cambian al recompilar sus archivos.

## 4. Preparar Prisma y la base de desarrollo

Comprueba la conexión de `back/.env`. Para una base nueva o migraciones pendientes:

```bash
npm --prefix back run db:migrate
```

El comando aplica el esquema y genera Prisma. Si la base ya está actualizada y
sólo falta el cliente generado:

```bash
npm --prefix back run db:generate
```

Estos pasos no crean una cuenta de Nexus ni se repiten en cada arranque.

## 5. Arrancar los dos procesos

En la primera terminal:

```bash
npm --prefix back run dev
```

Espera a que la API anuncie su puerto y permanezca activa. En otra terminal,
también desde la raíz:

```bash
npm --prefix front run dev
```

Abre `http://localhost:5173/inicio-sesion` e ingresa con la cuenta del entorno.
Vite informa si el puerto 5173 está ocupado. Conserva el mismo host durante la
sesión y deja ambas terminales abiertas; Ctrl+C detiene cada proceso.

## 6. Comprobar el resultado

| Comprobación | Resultado esperado |
| --- | --- |
| Abrir la página | Formulario de acceso sin errores de imports. |
| Ingresar | Página permitida para la cuenta. |
| Modificar un componente | Vite actualiza la vista. |

En los siguientes arranques repite el paso 5; prepara antes las dependencias o
migraciones sólo si cambiaron.

## 7. Comprobaciones y compilación

Para formato, lint, unitarias y compilación con tipos:

```bash
npm --prefix front run check
```

Para revisar la compilación local:

```bash
npm --prefix front run build
npm --prefix front run preview
```

`build` produce `front/dist`; `preview` anuncia su URL. Las
[pruebas de navegador y sistema](../testing/06-test-files-and-credentials.md) y el
[despliegue](03-build-and-deployment.md) tienen sus propios procedimientos.

## Diagnóstico por síntoma

| Síntoma | Qué revisar |
| --- | --- |
| `ENOENT ... package.json` | Ejecuta con `npm --prefix front ...` o `npm --prefix back ...`; la raíz no tiene manifiesto. |
| No se resuelve `axios`, `vee-validate` o la fuente | Sigue la [recuperación de dependencias](#dependencias-no-resueltas-en-vite). |
| No se resuelve `@nexus/*` | Comprueba la rama y las fuentes públicas del repositorio completo. |
| Falta `back/generated/prisma/client.ts` | Configura `back/.env` y ejecuta `npm --prefix back run db:generate`. |
| `502` o `ECONNREFUSED` | Comprueba que la API está activa en `BACKEND_PROXY_TARGET`; reinicia Vite si modificaste su entorno. |
| `401` o `403` con la API respondiendo | Revisa sesión, credenciales y permisos. |
| `EBADENGINE` | Compara Node con los dos manifiestos y actualiza el ejecutable a una rama admitida. |

### Dependencias no resueltas en Vite

Detén Vite y reinstala las dependencias declaradas. Ejemplo para `vee-validate`:

```bash
npm --prefix front ci --include=dev
npm --prefix front ls vee-validate --depth=0
npm --prefix front run dev -- --force
```

Continúa si `ci` termina correctamente y `ls` encuentra el paquete. Si falta,
revisa la rama, `front/package.json` y el lockfile. `--force` rehace la caché de Vite;
no instala dependencias.

## Archivos locales ignorados y su ubicación

| Archivo o directorio | Ubicación y preparación |
| --- | --- |
| Variables de la API | `back/.env`, creado localmente. |
| Variables de Vue | `front/.env.local`, copia opcional de `.env.example`. |
| Dependencias | `back/node_modules` y `front/node_modules`, instaladas por separado. |
| Cliente Prisma | `back/generated/prisma`, producido por `db:generate`. |
| Compilación | `front/dist`, producido por `build`. |
| Resultados documentales y de pruebas | `front/build/docs` y `front/build/test-results`. |

Git no recupera estos archivos. Conserva los entornos ya configurados y regenera
los resultados con sus comandos; no edites `node_modules` ni el cliente Prisma.
Las [credenciales de manuales](../governance/07-manual-accounts-and-files.md) y las
[de pruebas](../testing/06-test-files-and-credentials.md) se preparan en sus guías.
