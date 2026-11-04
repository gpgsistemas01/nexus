# 7. Generar manuales por cuenta

La generación es sólo para desarrollo local. Use el usuario y la contraseña de
una cuenta del entorno de desarrollo.
La herramienta detecta sus áreas, roles y permisos al iniciar sesión.

Guarde estos archivos **directamente en `front/`, junto a `package.json`**:

```text
front/
├── package.json
├── manual.accounts.local.json
├── .env.manual.local
├── src/
└── docs/
```

El JSON identifica las ediciones; `.env.manual.local` reúne sus usuarios y
contraseñas. Ambos son locales, ignorados por Git y excluidos del despliegue.
Los comandos siguientes se ejecutan desde **`front/`** (`cd front` desde la raíz).

## 1. Elegir el tipo de generación

| Necesidad | Comando o modo | Requisitos |
| --- | --- | --- |
| Sólo capturas por cuenta | `npm run docs:screenshots -- --all` | API funcionando, cuentas y los dos archivos locales. Inicia Vue si hace falta. |
| Capturas y manuales por cuenta | `npm run docs:manuals -- --all` | Lo anterior y herramientas de Word/PDF. |
| Revisar ediciones ficticias | `npm run docs:manuals -- --mode demo --all` | Perfiles incluidos; no usa credenciales. Inicia Vite en el puerto 5177. |

El modo predeterminado es `dev`: ambos comandos leen
`manual.accounts.local.json` y `.env.manual.local`. `docs:manual` es un alias de
`docs:manuals`. Los comandos con sufijo `:reference` mantienen las capturas y el
manual general descritos en [mantenimiento](05-user-manual.md).

Instalar dependencias y navegador en el equipo de desarrollo:

```bash
npm ci --include=dev
npx playwright install chromium
```

Para Word/PDF, completar la [preparación del publicador](02-generation-and-publication.md#preparación-del-publicador).
En una terminal aparte, mantener activa la API según la
[guía local](../development/01-getting-started.md): `npm --prefix back run dev`
desde la raíz. Ejecutar el comando de capturas o manuales en otra terminal.

En HTTP, la herramienta inicia Vite en el host y puerto de `baseUrl`, o reutiliza
el que ya esté activo. Al terminar cierra sólo el Vite que ella inició. Un origen
HTTPS local necesita su servidor TLS ya configurado y activo.
La generación rechaza `NODE_ENV=production` y
direcciones ajenas a `localhost`, `127.0.0.1` o `[::1]`. Los scripts, las credenciales
y Chromium permanecen fuera de la imagen final de producción.

## 2. Qué contiene cada archivo de entrada

Rutas relativas a `front/`:

| Archivo | Función |
| --- | --- |
| [manual.accounts.example.json](../../manual.accounts.example.json) | Plantilla versionada: perfiles de referencia, dirección de Vue, accesos esperados y nombres de variables. Sin credenciales. |
| `manual.accounts.local.json` | Copia local: dirección de Vue y cuentas que se procesarán. Predeterminado de `--accounts`; no crea usuarios. |
| [.env.manual.example](../../.env.manual.example) | Plantilla versionada con variables vacías para usuarios y contraseñas. |
| `.env.manual.local` | Credenciales reales de todas las cuentas configuradas. Predeterminado de `--env-file`. |

`front/.env.local` configura Vite y `back/.env` configura la API; las credenciales
de manuales no van en esos archivos. Las variables `DOCS_FRONT_*` indicadas por `usernameEnv` y `passwordEnv`
se completan en `.env.manual.local` sólo para
las cuentas que se quieran procesar. No llevan `VITE_` ni se compilan en el navegador.
Las variables internas `FRONT_MANUAL_*` las genera el comando; no hay que agregarlas
al archivo. Su función se describe en la [configuración interna](06-manuals-by-access.md#configuración-interna-del-recorrido).

## 3. Obtener el usuario y la contraseña

Si la cuenta ya permite ingresar a Nexus, continuar en el paso 4. Si falta la
cuenta o su contraseña, acudir al responsable de usuarios; el procedimiento está
en [Usuarios](../user-manual/08-users.md).

Para `dev`, preparar también registros de capacitación: una edición requiere un
registro existente y una devolución de Almacén requiere una salida surtida.
Los recorridos no registran operaciones para preparar las imágenes.

## 4. Crear las dos copias locales

Estos comandos copian sólo los archivos que aún no existen.

PowerShell:

```powershell
if (-not (Test-Path manual.accounts.local.json)) {
    Copy-Item manual.accounts.example.json manual.accounts.local.json
}
if (-not (Test-Path .env.manual.local)) {
    Copy-Item .env.manual.example .env.manual.local
}
```

Bash:

```bash
if [ ! -e manual.accounts.local.json ]; then
    cp manual.accounts.example.json manual.accounts.local.json
fi
if [ ! -e .env.manual.local ]; then
    cp .env.manual.example .env.manual.local
fi
```

Descargar cambios de Git actualiza las plantillas, no las copias locales.

## 5. Configurar el perfil en el JSON

Para una cuenta, usar este contenido en `manual.accounts.local.json` y ajustar
`baseUrl` a la dirección de Vue:

```json
{
    "baseUrl": "http://127.0.0.1:5173",
    "accounts": [
        {
            "id": "cuenta-01",
            "label": "Manual de capacitación 01",
            "usernameEnv": "DOCS_FRONT_CUENTA_01_USER",
            "passwordEnv": "DOCS_FRONT_CUENTA_01_PASSWORD"
        }
    ]
}
```

| Campo | Cómo completarlo |
| --- | --- |
| `baseUrl` | Origen local de Vue, por ejemplo `http://127.0.0.1:5173`; no el puerto de la API. HTTP o HTTPS en `localhost`, `127.0.0.1` o `[::1]`, sin ruta, parámetros ni credenciales. |
| `accounts` | Lista de cuentas posibles; se procesan las que tengan usuario y contraseña. |
| `id` | Identificador documental único, con letra minúscula inicial, minúsculas, números y guiones. Determina `--profile` y la carpeta; no es el usuario de ingreso ni el ID de base de datos. |
| `label` | Nombre legible de la edición; no asigna permisos. |
| `usernameEnv`, `passwordEnv` | Nombres de variables `DOCS_FRONT_*`; los valores reales van en `.env.manual.local`. |

### Distinguir varias ediciones

Agregar un bloque por cuenta, con otro `id`, `label` y variables; por ejemplo,
`cuenta-02`, `DOCS_FRONT_CUENTA_02_USER` y `DOCS_FRONT_CUENTA_02_PASSWORD`.
Separar los bloques con coma, sin coma final, y agregar sus credenciales al mismo
`.env.manual.local`.

Cada cuenta tiene sesión y carpeta propias. Su manual muestra áreas, roles y tareas
permitidas. Usa un `id` distinto para cada usuario, aunque compartan rol y área;
por ejemplo, `ana-almacen` y `luis-almacen`. Las áreas y roles se obtienen de la
sesión; los nombres de las variables y las etiquetas no asignan accesos.

## 6. Completar las credenciales locales

En `.env.manual.local`, sustituir los valores de muestra por las credenciales de
la cuenta existente:

```dotenv
DOCS_FRONT_CUENTA_01_USER="USUARIO"
DOCS_FRONT_CUENTA_01_PASSWORD="CONTRASENA"
```

Los nombres deben coincidir exactamente con el JSON. La sintaxis dotenv permite
comillas para conservar espacios o `#` dentro del valor. No escribir credenciales
en el JSON ni en las plantillas versionadas.

Si falta el usuario o la contraseña, o alguno está vacío, la cuenta se omite.
Puedes dejar sin completar las cuentas que todavía no utilizarás.

## 7. Generar capturas y manuales

Con la API funcionando, elige el resultado que necesitas; Vue se prepara automáticamente.

Sólo capturas de una cuenta:

```bash
npm run docs:screenshots -- --profile cuenta-01
```

Sólo capturas de todas las cuentas del JSON:

```bash
npm run docs:screenshots -- --all
```

Capturas actualizadas y manuales Word/PDF de todas las cuentas en una ejecución:

```bash
npm run docs:manuals -- --all --format ambos
```

Sustituye `--all` por `--profile cuenta-01` para generar una sola edición.
`--profile` usa el `id` del JSON. La herramienta comprueba sus credenciales antes
de abrir el navegador, informa los identificadores omitidos sin mostrar valores
y autentica las cuentas completas por separado. `--all` selecciona la lista del
JSON, no todos los usuarios de la base ni todas las variables del `.env`.

Si no hay cuentas con credenciales completas, termina sin abrir el navegador ni
exportar documentos. Las cuentas omitidas conservan sus archivos anteriores;
esta ejecución no actualiza sus capturas ni sus manuales.

Para revisar las opciones, usa `npm run docs:manuals -- --help`.
Para una edición ficticia:

```bash
npm run docs:manuals -- --mode demo --profile instalaciones-instalador --format ambos
```

En `demo`, sustituir `--profile instalaciones-instalador` por `--all` para revisar
todos los perfiles incluidos. Este modo no lee credenciales ni demuestra permisos
de una instalación real. Añadir `--capture-only` obtiene fuentes y capturas sin
invocar Pandoc/LibreOffice.

## 8. Entender los archivos generados

| Ruta bajo `front/` | Contenido |
| --- | --- |
| `build/manuals/<cuenta>/sources/index.md` | Portada, alcance e índice de la cuenta. |
| `build/manuals/<cuenta>/sources/*.md` | Capítulos filtrados y glosario. Corregir sus originales en `docs/user-manual`; se regeneran. |
| `build/manuals/<cuenta>/images/*.png` | Capturas propias; en `dev`, muestran los datos visibles para esa cuenta. |
| `build/manuals/<cuenta>/manifest.json` | Estado `pending`/`ready`, permisos, fuentes y huellas de vigencia y reanudación. No editar a mano; no contiene contraseñas. |
| `build/docs/docx/manuales-vue/<cuenta>/manual-<cuenta>.docx` | Word, después de completar las capturas requeridas. |
| `build/docs/pdf/manuales-vue/<cuenta>/manual-<cuenta>.pdf` | PDF, si se solicitó y terminó la conversión. |
| `build/test-results/manual-profiles.xml` | Reporte del recorrido para diagnosticar fallos; no es el manual. |

`<cuenta>` es el `id` del JSON, por ejemplo `cuenta-01`. Cada usuario conserva sus
imágenes aunque otro tenga el mismo rol y área:

```text
front/build/manuals/
├── cuenta-01/images/
└── cuenta-02/images/
```

Cookies y tokens permanecen en memoria; no se necesita un archivo de sesión ni
copiar cookies del navegador.

## 9. Reanudar y localizar un problema

```bash
npm run docs:manuals -- --profile cuenta-01 --missing --format ambos
```

`--missing` conserva capturas cuando coinciden cuenta, acceso, modo, fuentes,
código del recorrido y huella del PNG; completa las pendientes o desactualizadas.
Sin esa opción, se recaptura el perfil completo.

| Situación | Recuperación |
| --- | --- |
| Entorno o dirección de producción | Ejecutar en desarrollo y usar el origen local de Vue. |
| Cuenta omitida | Completar usuario y contraseña cuando se quiera generar su edición. |
| `ECONNREFUSED 127.0.0.1:5173` | El comando no pudo conectar con Vue; no indica contraseña incorrecta. Revisar `baseUrl` y el arranque automático de Vite. La API debe permanecer activa en otra terminal. |
| Login HTTP 400/401 | Revisar las variables indicadas por `usernameEnv`/`passwordEnv` y probar esas credenciales en una ventana privada en el mismo `baseUrl`. Un 401 también puede indicar una cuenta inactiva. |
| Login HTTP 404/405 o respuesta no válida | Revisar `baseUrl` del JSON y el proxy `/api`; debe responder la API de Nexus, sin redirección a una página HTML. |
| Login HTTP 429 | Esperar antes de volver a ejecutar; no repetir intentos con credenciales dudosas. |
| Login HTTP 500/502/503/504 o `ECONNREFUSED`/`ECONNRESET` | Revisar Vue, la API y sus terminales. El código distingue un servicio no disponible de credenciales rechazadas. |
| Cuenta distinta del perfil | Revisar `expectedAccess`, área/rol real y referencia de credenciales. |
| Tabla vacía | Puede servir para consulta. Para editar, preparar un registro existente. |
| Falta una opción | Revisar dependencias, registros activos y permisos. Para pesos se necesita un material de referencia ROLLO. |
| Falta devolución | Comprobar permiso de Almacén y salida surtida existente; no se surte automáticamente. |
| Falla un selector o recorrido | Revisar imagen y motivo en `manifest.json`, corregir y reanudar. |
| Intenta escribir datos de negocio | Corregir la automatización; no habilitar el envío para obtener una imagen. |
| Cambió el acceso | Autenticar de nuevo y regenerar la edición. |
| Cambió un PNG | Recapturar; la imagen alterada no se publica como verificada. |
| Falla Word/PDF | Revisar Pandoc/LibreOffice y código de salida. Una versión anterior no acredita la ejecución actual. |

## 10. Revisar y distribuir

Abrir Word/PDF y comprobar:

1. Título, áreas y roles de la cuenta correcta.
2. Índice y tareas acordes con su acceso.
3. Pasos, etiquetas, advertencias y recuperación iguales a las pantallas.
4. Capturas y tablas completas y legibles.
5. Datos visibles aptos para compartir con los destinatarios.

Distribuir los documentos revisados por el canal autorizado. El estado editorial
permanece En revisión hasta su aceptación. Las
[garantías de captura](06-manuals-by-access.md#garantías-durante-la-captura)
describen los controles de sesión y escrituras.

## Opciones adicionales

| Opción | Uso |
| --- | --- |
| `expectedAccess` en el JSON | Comprueba opcionalmente un rol y área. La plantilla puede incluirlo; se puede omitir. No asigna permisos. |
| Variables del proceso/CI | Sustituyen las credenciales locales y tienen prioridad sobre `.env.manual.local`. |
| `--accounts`, `--env-file` | Seleccionan otros archivos de cuentas y credenciales. |
