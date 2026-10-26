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
para pruebas aisladas, conforme a [la guía de sistema](../testing/04-system-tests.md).
La aplicación necesita una cuenta activa y permisos existentes; esta guía no
inventa una cuenta o contraseña inicial.

Para crear el archivo opcional del frontend en **PowerShell**, si aún no existe:

```powershell
Copy-Item front/.env.example front/.env.local
```

En **Bash**, para la misma copia inicial:

```bash
cp front/.env.example front/.env.local
```

Conserva un archivo ya configurado; la copia inicial no es un paso de cada arranque.
Si Express usa otro puerto, ajusta `BACKEND_PROXY_TARGET` con ese origen. El valor
predeterminado es `http://127.0.0.1:3000`; esta variable configura Vite, no el navegador.

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
[acceso y sesión](../modules/01-authentication.md). Para detener el desarrollo usa Ctrl+C en cada terminal.
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

El [recorrido de sistema](../testing/04-system-tests.md) complementa esas pruebas
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
