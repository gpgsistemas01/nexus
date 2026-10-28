# 1. Preparar e iniciar el proyecto Vue

## Propósito y condiciones iniciales

Este procedimiento permite preparar una copia de desarrollo y abrir el frontend
Vue conectado a Express. Está dirigido a quien trabaja en el repositorio completo,
desde Windows/PowerShell o Linux/macOS/Bash. Los comandos npm siguientes se ejecutan
desde **la raíz que contiene `front/` y `back/`**, usando `--prefix`; no existe un
`package.json` en esa raíz para ejecutar `npm run dev` sin seleccionar aplicación.

Se necesita Git, npm, Node compatible y PostgreSQL disponible para desarrollo.
El frontend no conecta directamente a PostgreSQL. La preparación mínima de la API se explica también aquí para que esta guía
sea ejecutable por sí misma. La administración avanzada de PostgreSQL pertenece
a la operación del servidor. No es necesario Docker para el
desarrollo local con Vite.

## 1. Comprobar la copia y Node

Si aún no tienes una copia, clona la rama que contiene esta implementación Vue
(actualmente `features`) y entra al repositorio:

```bash
git clone --branch features https://github.com/gpgsistemas01/nexus.git
cd nexus
```

Si ya trabajas en una copia local, abre su raíz; no es necesario clonarla otra vez.
Conserva todo el repositorio: los alias `@nexus/*` necesitan módulos públicos de
`back/` durante la compilación. Copiar únicamente `front/` no prepara una copia
independiente. Comprueba que la terminal está en la carpeta correcta:

```bash
git status --short
node --version
npm --version
```

La versión de Node debe satisfacer **ambos** manifiestos. Para la configuración
actual sirven Node 24 desde 24.15.0, Node 22 desde 22.22.2 o Node 26 desde 26.12.1,
dentro de su rama. La fuente vigente es `engines` de
[front/package.json](../../package.json) y [back/package.json](../../../back/package.json).
Instalar npm o cambiar `engines` no actualiza el ejecutable de Node.

## 2. Instalar dependencias de cada aplicación

```bash
npm --prefix back ci --include=dev
npm --prefix front ci --include=dev
```

Cada comando instala en su propio `node_modules` a partir del lockfile. Debe
terminar correctamente antes de continuar. Descargar cambios de Git no instala
dependencias ni genera el cliente Prisma. No se usa `npm update` para reproducir
la instalación del proyecto.

## 3. Preparar los archivos locales

| Archivo | Preparación y finalidad |
| --- | --- |
| `back/.env` | Crear el archivo local con las [variables del backend](../../../back/README.md#variables-de-entorno): conexión de desarrollo `DATABASE_URL`, conexión de migración cuando corresponda y secretos `JWT_SECRET_ACCESS`, `JWT_SECRET_REFRESH`, `JWT_SECRET_ONE_TIME`. Puerto local habitual: `3000`. |
| `front/.env.local` | Opcional si se usan los valores predeterminados. Copiar [front/.env.example](../../.env.example) para cambiar `BACKEND_PROXY_TARGET` o el logo público. Reiniciar Vite tras modificarlo. |

El repositorio no contiene `back/.env.example`; no se indica copiar un archivo
inexistente. Crea `back/.env` con la configuración mínima siguiente y usa valores
propios del entorno de desarrollo. No copies secretos de PostgreSQL/JWT a Vue
ni a variables `VITE_*`, porque estas últimas se incluyen en el cliente compilado.
Los archivos `.env` permanecen ignorados por Git y por el contexto Docker.

### Configuración mínima de la API de desarrollo

Ejemplo de estructura para `back/.env`; sustituir todos los valores de demostración
por los del entorno local. No es un archivo de credenciales listo para producción.

```dotenv
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://usuario_local:clave_local@127.0.0.1:5432/nexus_dev"
JWT_SECRET_ACCESS="reemplazar-por-secreto-local-independiente"
JWT_SECRET_REFRESH="reemplazar-por-otro-secreto-local-independiente"
JWT_SECRET_ONE_TIME="reemplazar-por-otro-secreto-local-independiente"
```

`DATABASE_URL` pertenece al proceso Express; PostgreSQL debe existir y aceptar esa
cuenta. Si las migraciones requieren otra conexión directa, definir `DIRECT_URL`
con la cuenta de migración del mismo ambiente. Los tres secretos JWT se configuran
en el servidor, no en Vue. `DATABASE_TEST_URL`/`DIRECT_TEST_URL` sólo se preparan
para pruebas aisladas, conforme a [la guía de sistema](../testing/05-system-tests.md).
La aplicación necesita una cuenta activa y permisos existentes; esta guía no
inventa una cuenta o contraseña inicial.

### Configurar `front/.env.local` para Vue

`front/.env.example` es una plantilla versionada. Copiarla crea
`front/.env.local`, junto a `front/package.json`; Vite lee esa copia para configurar
el frontend. La copia no instala dependencias, no crea usuarios y no inicia Express.
Si usa la API local en `http://127.0.0.1:3000` y no necesita logo personalizado,
puede trabajar sin crear el archivo: el código ya tiene esos valores por defecto.

En **PowerShell**, desde la raíz que contiene `front/` y `back/`, ejecute sólo si
todavía no existe:

```powershell
if (-not (Test-Path front/.env.local)) {
    Copy-Item front/.env.example front/.env.local
}
```

En **Bash**, desde esa misma raíz:

```bash
if [ ! -e front/.env.local ]; then
    cp front/.env.example front/.env.local
fi
```

Si la terminal ya está dentro de `front/`, omita `front/` en las rutas del bloque:
la copia es de `.env.example` a `.env.local`. Usar `front/.env.local` desde esa
carpeta apuntaría a una subcarpeta diferente. En Windows, compruebe que el editor
guardó exactamente `.env.local`, sin añadir `.txt`.

Abra **`front/.env.local`** en su editor. La configuración inicial es:

```dotenv
BACKEND_PROXY_TARGET=http://127.0.0.1:3000
VITE_LOGIN_LOGO_URL=
```

| Variable | Quién la utiliza | Qué debe escribir |
| --- | --- | --- |
| `BACKEND_PROXY_TARGET` | El proceso Vite de desarrollo o vista previa. Reenvía las peticiones de `/api` y `/cerrar-sesion` a Express. No se expone como `import.meta.env` al cliente Vue. | Origen de Express con protocolo, host y puerto, por ejemplo `http://127.0.0.1:3000`. No agregue `/api`, una página, usuario o contraseña. |
| `VITE_LOGIN_LOGO_URL` | El componente de login. Es un valor público incorporado al frontend. | Déjelo vacío para mostrar N. Para `front/public/logo.png`, escriba `/logo.png`; también se admite una URL pública. El archivo del logo debe existir. |

Por ejemplo, si Express escucha en 3001, cambie únicamente el destino del proxy:

```dotenv
BACKEND_PROXY_TARGET=http://127.0.0.1:3001
```

Eso no cambia el puerto de Express ni el de Vue. Configure el `PORT` del backend
en `back/.env` para que coincida con el puerto real anunciado por Express. Continúe
abriendo las páginas desde Vite, normalmente en `http://localhost:5173`; no use el
destino del proxy como dirección del frontend.

#### Cuándo se aplican los cambios

1. Guarde la copia local. Modificar sólo `.env.example` no cambia la configuración
   utilizada: Vite no carga esa plantilla.
2. Si Vite está abierto, deténgalo con Ctrl+C y vuelva a ejecutar, desde la raíz,
   `npm --prefix front run dev`. Vite lee los archivos de entorno al arrancar.
3. Compruebe la página de inicio y la comunicación con la API. Si hay un 502 o
   `ECONNREFUSED`, confirme primero que Express esté activo en el destino indicado.

Para comprobar una compilación, vuelva a ejecutar `npm --prefix front run build`
y reinicie `preview` si lo estaba usando. El logo `VITE_*` queda incorporado en
los assets: cambiar una variable después de compilarlos no cambia esos archivos.

Vite carga `.env.local` en desarrollo y compilación. Si configura también archivos
por modo, el orden de menor a mayor prioridad es `.env`, `.env.local`,
`.env.[modo]` y `.env.[modo].local`; las variables ya definidas en el proceso tienen
prioridad sobre esos archivos. `build` usa normalmente el modo `production`.
Si un cambio parece ignorado, compruebe esas otras fuentes y reinicie el proceso.

#### Separación de archivos y despliegue

| Configuración | Dónde corresponde |
| --- | --- |
| Proxy local y logo de Vue | `front/.env.local`; configuración descrita aquí. |
| PostgreSQL y secretos JWT | `back/.env` o entorno de Express. No se copian a Vue. |
| Credenciales para generar manuales por cuenta | `front/.env.manual.local`, según la [guía de manuales](../governance/07-manual-accounts-and-files.md). |
| Conexiones de pruebas de sistema | Variables de la terminal/CI según la [preparación de pruebas](../testing/06-test-files-and-credentials.md). |

Las variables con prefijo `VITE_*` son públicas. Mantenga en esta copia sólo la
configuración indicada; no agregue contraseñas, tokens ni conexiones de base de
datos. `.env.local` está ignorado por Git: cada desarrollador prepara su copia y
actualizar el repositorio no recupera sus valores locales. No vuelva a copiar la
plantilla sobre un archivo ya configurado.

El Dockerfile del frontend excluye los `.env` locales. En Docker, el destino de
la API se configura con `BACKEND_UPSTREAM` al arrancar Nginx; para el logo se utiliza
el argumento de construcción `VITE_LOGIN_LOGO_URL`. En hosting estático, configure
las variables de build y el proxy del proveedor. `BACKEND_PROXY_TARGET` controla
Vite dev/preview; no configura esos proxies de producción. Consulte
[compilación y despliegue](03-build-and-deployment.md).

## 4. Preparar Prisma y la base de desarrollo

Si se prepara una base de desarrollo nueva o faltan migraciones por aplicar,
comprueba primero que las URLs locales apuntan a **esa base** y sigue el
procedimiento local:

```bash
npm --prefix back run db:migrate
```

Ese script aplica migraciones y genera el cliente Prisma. Si la base ya está al
día y sólo falta regenerar el cliente después de instalar o cambiar el esquema:

```bash
npm --prefix back run db:generate
```

No son comandos obligatorios en cada arranque. No uses una base de producción
para este procedimiento ni una base de desarrollo como base de pruebas.
La configuración de pruebas persistentes requiere sus URLs aisladas; no hace
falta prepararlas para abrir Vue con una API de desarrollo ya operativa.

La base debe tener una cuenta activa y accesos adecuados para iniciar sesión.
Esta guía no inventa una contraseña predeterminada ni crea una cuenta automáticamente;
la gestión de identidades pertenece al servidor y a la preparación del entorno.

## 5. Arrancar los dos procesos

En una primera terminal, desde la raíz:

```bash
npm --prefix back run dev
```

Comprueba que Express anuncia su puerto y que el proceso permanece activo. En
una segunda terminal, también desde la raíz:

```bash
npm --prefix front run dev
```

Vite usa `5173` con `strictPort`; si está ocupado informa del conflicto. Abre
`http://localhost:5173/inicio-sesion` con la cuenta del entorno. Para conservar
un origen consistente durante la sesión, usa el mismo host en las páginas Vue.
Vite deriva `/api` y `/cerrar-sesion` al backend; las páginas se abren desde
el origen del frontend.

## 6. Comprobar el resultado

| Observación | Resultado esperado |
| --- | --- |
| Página inicial | Se presenta el formulario Vue sin errores de imports en Vite. |
| API antes de iniciar sesión | Un 401 puede indicar ausencia de sesión; no equivale a un 502 del proxy. |
| Acceso válido | La aplicación abre la primera ruta Vue permitida para la cuenta. Una cuenta sin el permiso de un módulo no recibe acceso por cambiar la URL. |
| Cambio de componente en desarrollo | Vite actualiza la vista; los errores de tipos también se revisan con el editor o `type-check`. |

La recuperación de sesión y los estados de rechazo se explican en
[acceso y sesión](../architecture/views/development/frontend-technical-documentation/01-authentication.md). Para detener el desarrollo usa Ctrl+C en cada terminal.
No hace falta eliminar dependencias o la base al terminar.

## 7. Comprobaciones y compilación

Para formato, ESLint, pruebas unitarias y compilación con tipos:

```bash
npm --prefix front run check
```

Los recorridos de navegador, su instalación de Playwright y sus respuestas simuladas
se describen en [pruebas de navegador](../../README.md#pruebas-de-navegador).
No sustituyen las integraciones de PostgreSQL. Para comprobar únicamente la
compilación y revisar el resultado local:

```bash
npm --prefix front run build
npm --prefix front run preview
```

`build` genera `front/dist`; `preview` anuncia su URL en la terminal y conserva
el proxy configurado. Vite `dev`/`preview` son herramientas locales. La publicación
mediante Nginx se explica en [Docker para VPS](../../README.md#docker-para-vps-o-pruebas-locales).

El [recorrido de sistema](../testing/05-system-tests.md) complementa esas pruebas
con Express y PostgreSQL reales, base aislada y procesos propios. Se ejecuta con
`npm --prefix front run test:e2e:system` después de su preparación, sin usar la
base ni los servidores habituales de desarrollo.
Los contenedores de frontend y backend pueden ser diferentes; sólo la construcción
de Vue necesita las fuentes públicas compartidas. `front/docs` permanece fuera del
contexto frontend y de la imagen final.

## Diagnóstico por síntoma

| Síntoma | Comprobación y corrección |
| --- | --- |
| `ENOENT ... SistemaMerma/package.json` | El comando se lanzó en la raíz sin aplicación. Usar `npm --prefix front ...` o `npm --prefix back ...`, o entrar a la carpeta correspondiente. |
| No se resuelve `axios`, `vee-validate` o la fuente | Detener Vite; completar `npm --prefix front ci --include=dev` y volver a iniciar. No instalar esas dependencias en `back/`. |
| No se resuelve `@nexus/*` | Confirmar que está disponible el repositorio completo y que las rutas públicas compartidas existen. Reinstalar npm no recupera archivos ausentes de Git. |
| Falta `back/generated/prisma/client.ts` | Verificar `back/.env` y ejecutar `npm --prefix back run db:generate`; no editar el archivo generado. |
| `502` o `ECONNREFUSED 127.0.0.1:3000` | Comprobar que Express siga activo y que `BACKEND_PROXY_TARGET` apunte al puerto real. Reiniciar Vite si cambió `.env.local`. |
| `401` o `403` con Express respondiendo | Revisar sesión, credenciales y permisos. Son rechazos HTTP diferentes de un fallo de conexión. |
| `EBADENGINE` | Comparar Node con ambos `engines`; actualizar Node dentro de una rama admitida antes de reinstalar dependencias. |

## Archivos locales ignorados y su ubicación

| Archivo/directorio | Ubicación y recuperación |
| --- | --- |
| Variables de API | `back/.env`; Git no lo mueve ni recupera al cambiar estructura. Mantenerlo junto al manifiesto backend. |
| Variables de Vite | `front/.env.local`; opcional y público sólo en las variables `VITE_*`. |
| Dependencias | `back/node_modules` y `front/node_modules`, instaladas por separado. Una carpeta antigua en la raíz no sustituye ninguna de ellas. |
| Cliente Prisma | `back/generated/prisma`, generado con `npm --prefix back run db:generate`; no se edita ni se obtiene del frontend. |
| Assets compilados | `front/dist`, producidos por build. No contienen las fuentes documentales. |
| Documentación exportada y pruebas | `front/build/docs` y `front/build/test-results`; artefactos locales/CI, ignorados en Git. |

Después de descargar cambios que alteran dependencias, detener el proceso afectado,
completar su `npm ci --include=dev` y reiniciar. No editar declaraciones dentro de
`node_modules`; esos archivos pertenecen a paquetes instalados. Los errores se
corrigen en la fuente/configuración y se comprueban de nuevo.
