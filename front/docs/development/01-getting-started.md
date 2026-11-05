# 1. Preparar e iniciar el proyecto Vue

Los comandos se ejecutan desde la **raíz del repositorio**, que contiene `front/`
y `back/`, usando `--prefix`. Necesitas Git, npm, PostgreSQL y una versión de Node
admitida por los manifiestos de [front](../../package.json) y
[back](../../../back/package.json). Para ingresar necesitas una cuenta activa en
la base del entorno.

La [consulta rápida de comandos](00-commands.md) reúne inicio, pruebas, capturas
y publicación para desarrolladores.

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
sus valores. Configura `NODE_ENV` para desarrollo, `DATABASE_URL` con la conexión
de tu base y tres secretos distintos: `JWT_SECRET_ACCESS`, `JWT_SECRET_REFRESH`
y `JWT_SECRET_ONE_TIME`. `PORT` es opcional y usa 3000 si se omite.

La base y su cuenta PostgreSQL deben existir. Si la migración requiere conexión
directa, agrega `DIRECT_URL` para esa misma base. Las variables y los secretos de
la API se quedan en este archivo; las variables `VITE_*` se publican en el navegador.
Las conexiones de pruebas se preparan por separado según la
[guía de sistema](../testing/05-system-tests.md).

### Configurar `front/.env.local` para Vue

Este archivo es opcional con la API en `http://127.0.0.1:3000` y el logo predeterminado.
Créalo localmente junto a `front/package.json` sólo para cambiar estas opciones:

| Variable | Valor y aplicación |
| --- | --- |
| `BACKEND_PROXY_TARGET` | Origen de la API, sin `/api` ni credenciales. Destino del proxy para API y cierre de sesión. |
| `VITE_LOGIN_LOGO_URL` | Público. Vacío muestra N; `/logo.png` usa `front/public/logo.png`. Admite URL pública. |

Si la API usa otro puerto, configura `BACKEND_PROXY_TARGET` con su origen completo.

Guarda el archivo y reinicia Vite. Este valor no cambia el `PORT` de la API ni el
puerto de Vue; sigue abriendo las páginas desde `http://localhost:5173`.

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

### Acceso desde un móvil en la red local

Conecta el móvil a la misma red y abre
`http://<IP_LOCAL_DEL_EQUIPO>:5173/inicio-sesion`. Vite escucha en `0.0.0.0`;
permite su puerto 5173 en el firewall del equipo. El navegador conserva el host
de Vue para la API: el proxy conecta desde el equipo servidor hacia Express,
normalmente en `127.0.0.1:3000`.

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
| `502` o `ECONNREFUSED` | El proxy no pudo conectar con la API. Comprueba que esté activa en el host y puerto de `BACKEND_PROXY_TARGET`. |
| `ECONNRESET` junto a reinicios al cargar `node_modules` | Detén el proceso anterior y ejecuta `npm --prefix back ci --include=dev` y `npm --prefix back run dev`. El script usa vigilancia limitada a `src/` y `.env`, para que la primera carga de Prisma no reinicie la API. |
| `ECONNRESET` sin reinicios | Compara acceso directo y proxy con las consultas siguientes y revisa la terminal de la API. |
| `[vite] (client) hmr update` | Vite actualizó un módulo editado; es un mensaje normal de desarrollo. |
| `500` con `tenant/user … not found` en Prisma | Corrige `DATABASE_URL` en `back/.env`: copia la cadena del pooler desde **Connect** del proyecto Supabase y reemplaza el marcador de contraseña. Host y usuario deben pertenecer al mismo proyecto. Reinicia la API. |
| `401` o `403` con la API respondiendo | Revisa sesión, credenciales y permisos. |
| `EBADENGINE` | Compara Node con los dos manifiestos y actualiza el ejecutable a una rama admitida. |

Las consultas y el refresh intentan recuperar un corte breve automáticamente. Si
el fallo persiste y la API vuelve al mismo host y puerto, reintenta desde la pantalla: **Volver
a comprobar el acceso** para la sesión, **Actualizar** o **Reintentar** para una
tabla y **Reintentar catálogo** para un selector. El proxy puede recuperarse sin
reiniciar Vite. En el login, pulsa **Ingresar** nuevamente; conserva los campos y no
reenvía credenciales automáticamente. Si cambiaste `BACKEND_PROXY_TARGET`, reinícialo
para aplicar el valor.

Para distinguir API y proxy, ejecuta sin cookies desde PowerShell. Ajusta los puertos
si no usas los predeterminados:

```powershell
curl.exe -sS -o NUL -w "API: %{http_code}\n" http://127.0.0.1:3000/api/auth/me
curl.exe -sS -o NUL -w "Vite: %{http_code}\n" http://localhost:5173/api/auth/me
```

`401` en ambas confirma que la conexión funciona sin sesión. Si falla también el
acceso directo, revisa el proceso de la API y su puerto. Si sólo falla Vite, revisa
`BACKEND_PROXY_TARGET` y el error del proxy; no lo atribuyas a la base de datos sin
el log correspondiente.

Para comprobar el puerto predeterminado desde PowerShell en el equipo que ejecuta
Vite, usa `Test-NetConnection 127.0.0.1 -Port 3000 -InformationLevel Quiet`.
`False` indica que no se pudo establecer la conexión TCP; conserva el log de la API
de ese momento para identificar la causa.

La API usa `DATABASE_URL`; `DIRECT_URL` se reserva para migraciones. El diagnóstico
de [Supabase sobre el pooler](https://supabase.com/kb/troubleshooting/tenant-or-user-not-found)
explica el formato de host y usuario. Conserva las credenciales sólo en `back/.env`.

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
| Variables de Vue | `front/.env.local`, creado localmente sólo si se necesita. |
| Dependencias | `back/node_modules` y `front/node_modules`, instaladas por separado. |
| Cliente Prisma | `back/generated/prisma`, producido por `db:generate`. |
| Compilación | `front/dist`, producido por `build`. |
| Resultados documentales y de pruebas | `front/build/docs` y `front/build/test-results`. |

Estos archivos son locales. Conservar los entornos configurados y regenerar resultados con
sus comandos; no editar `node_modules` ni Prisma. Las guías de
[manuales](../governance/07-manual-accounts-and-files.md) y
[pruebas](../testing/06-test-files-and-credentials.md) explican sus credenciales.
