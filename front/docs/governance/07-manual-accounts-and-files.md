# 7. Generar manuales por cuenta

## Propósito y punto de partida

Esta guía reúne el procedimiento completo: preparar las cuentas, configurar los
archivos, generar capturas, revisar los manuales y recuperar una ejecución fallida.

Para generar el manual de una cuenta, use su usuario y contraseña habituales.
El generador inicia sesión y obtiene automáticamente sus áreas, roles y permisos;
no necesita escribirlos en la configuración.

Guarde los dos archivos locales **directamente en la carpeta `front/`, junto a
su `package.json`**:

- `front/manual.accounts.local.json`: dirección del sistema y lista de manuales que se generarán.
- `front/.env.manual.local`: usuarios y contraseñas de esas cuentas, todos en el mismo archivo.

La ubicación desde la raíz del repositorio debe quedar así:

```text
front/
├── package.json
├── manual.accounts.local.json
├── .env.manual.local
├── src/
└── docs/
```

Ambos archivos quedan fuera de `src/` y `docs/`. Las rutas predeterminadas del
generador parten de `front/`; las credenciales de manuales tampoco van en `back/.env`.

Cada cuenta tiene un `id` para distinguir su carpeta y un `label` para identificar
el manual. Sus capturas y tareas dependen del acceso real de esa cuenta.
Los comandos de esta guía se ejecutan desde **`front/`**; si está en la raíz,
entre con `cd front`.

## 1. Elegir el tipo de generación

| Necesidad | Comando o modo | Cuenta y archivos requeridos |
| --- | --- | --- |
| Revisar manuales con datos ficticios. | `docs:manuals -- --mode demo --all` | Perfiles incluidos en la herramienta; no necesita cuentas reales, JSON local ni contraseñas. Inicia su propio Vite en el puerto 5177. |
| Obtener los manuales de las cuentas configuradas. | `docs:manuals -- --mode live --all` | Cuentas existentes, Vue/API funcionando y los dos archivos locales explicados abajo. |
| Publicar el manual general de referencia. | `docs:manual -- ambos` | Fuentes e imágenes de `docs/user-manual`. No inicia sesión ni selecciona contenido por cuenta. |

Para instalar las dependencias y el navegador de captura:

```bash
npm ci --include=dev
npx playwright install chromium
```

La exportación Word requiere Pandoc; PDF requiere además LibreOffice. La
[preparación del publicador](02-generation-and-publication.md#preparación-del-publicador)
explica su instalación y comprobación. Para `live`, prepare e inicie los servicios
con la [guía local](../development/01-getting-started.md). El generador no los arranca
en ese modo. En un entorno remoto, use la dirección HTTPS de Vue.

## 2. Qué contiene cada archivo de entrada

Todas las rutas de esta tabla son relativas a `front/`.

| Archivo | Quién lo prepara y qué significa | Tratamiento |
| --- | --- | --- |
| [manual.accounts.example.json](../../manual.accounts.example.json) | Plantilla versionada con los perfiles de referencia, el origen de Vue, las asignaciones esperadas y los nombres de variables. No contiene credenciales. | Se copia al preparar una configuración local por primera vez. |
| `manual.accounts.local.json` | El publicador conserva los perfiles que utilizará y configura su dirección de Vue. Selecciona qué cuentas procesar; no crea esas cuentas. | Local, ignorado por Git. Predeterminado de `--accounts`. |
| [.env.manual.example](../../.env.manual.example) | Plantilla versionada con variables vacías para nombres de usuario y contraseñas. | Se copia; los valores reales se escriben únicamente en la copia local. |
| `.env.manual.local` | Valores de las credenciales que leerá el proceso de captura. No es un archivo de sesión ni una contraseña generada automáticamente. | Local, ignorado por Git. Predeterminado de `--env-file`. |
| `.env.local` | Configuración opcional de Vite, por ejemplo `BACKEND_PROXY_TARGET` para conectar la API local. | Su propósito es iniciar Vue; las credenciales de los manuales van en `.env.manual.local`. |
| `../back/.env` | Configuración del proceso Express y su base de datos. | Se prepara al iniciar la API. No se copia a los archivos de manuales. |

Los nombres `DOCS_FRONT_*` son variables de la herramienta de captura. No llevan
el prefijo `VITE_` y no se incorporan a los assets compilados del navegador.
Los archivos de configuración, fuentes y resultados de los manuales permanecen
fuera del despliegue del frontend.

## 3. Obtener el usuario y la contraseña

Si ya puede ingresar a Nexus con esa cuenta, continúe en el paso 4. No necesita
crear otro usuario para generar el manual.

Si todavía no tiene cuenta o desconoce su contraseña, solicite ayuda al responsable
de usuarios. El procedimiento de alta y cambio de contraseña está en
[Usuarios](../user-manual/08-users.md). El generador usa cuentas existentes.

Antes de capturar en `live`, deben existir también los datos que se van a mostrar:
por ejemplo, un registro para editar o una salida surtida para ilustrar la devolución
de Almacén. El recorrido no registra operaciones para fabricar esos ejemplos.

## 4. Crear las dos copias locales

Ejecute la copia sólo para archivos que todavía no existan. Estos comandos conservan
las configuraciones anteriores.

En PowerShell, desde `front/`:

```powershell
if (-not (Test-Path manual.accounts.local.json)) {
    Copy-Item manual.accounts.example.json manual.accounts.local.json
}
if (-not (Test-Path .env.manual.local)) {
    Copy-Item .env.manual.example .env.manual.local
}
```

En Bash, desde la misma carpeta:

```bash
if [ ! -e manual.accounts.local.json ]; then
    cp manual.accounts.example.json manual.accounts.local.json
fi
if [ ! -e .env.manual.local ]; then
    cp .env.manual.example .env.manual.local
fi
```

Abra ambas copias en su editor. Descargar cambios de Git actualiza las plantillas,
pero no crea ni actualiza sus archivos locales.

## 5. Configurar el perfil en el JSON

Reemplace el contenido de `manual.accounts.local.json` con este ejemplo para una
cuenta y ajuste `baseUrl` a la dirección donde abre Vue:

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

| Campo | Significado y forma de completarlo |
| --- | --- |
| `baseUrl` | Origen del frontend que abrirá el navegador, sin ruta, parámetros ni credenciales. Use el origen donde funciona Vue; no el puerto directo de Express. Se admite HTTP en localhost o HTTPS. |
| `accounts` | Lista de perfiles que se pueden procesar. Conserve sólo las cuentas que va a preparar; cada entrada necesita sus credenciales. |
| `id` | Identificador del perfil documental, único en la lista. Usa minúsculas, números y guiones; determina `--profile` y las carpetas de resultados. No es el nombre de ingreso ni el identificador de la base de datos. |
| `label` | Nombre legible para identificar la edición. No configura permisos ni tiene que coincidir con un rol. |
| `usernameEnv` | Nombre de la variable que contiene el usuario de ingreso. Aquí se escribe `DOCS_FRONT_..._USER`, no el usuario real. |
| `passwordEnv` | Nombre de la variable que contiene su contraseña. Aquí se escribe `DOCS_FRONT_..._PASSWORD`, no la clave real. |

### Distinguir varias ediciones

Para agregar otra cuenta, copie el bloque dentro de `accounts` y cambie `id`,
`label`, `usernameEnv` y `passwordEnv`. Por ejemplo, use `cuenta-02` y variables
`DOCS_FRONT_CUENTA_02_USER` / `DOCS_FRONT_CUENTA_02_PASSWORD`. Agregue sus valores
al mismo `.env.manual.local`. Separe los bloques con una coma, sin coma al final.

El generador inicia una sesión independiente por cuenta y guarda cada manual en
su propia carpeta. El manual muestra las áreas y roles detectados. Si la cuenta
tiene varios accesos, incluye las tareas permitidas por todos ellos. Dos cuentas
con los mismos permisos pueden tener las mismas secciones.

## 6. Completar las credenciales locales

En `.env.manual.local`, complete las variables referenciadas por el JSON. Ejemplo
de estructura; **sustituya los dos valores de muestra por los de la cuenta existente**:

```dotenv
DOCS_FRONT_CUENTA_01_USER="USUARIO"
DOCS_FRONT_CUENTA_01_PASSWORD="CONTRASENA"
```

Los nombres de las variables deben coincidir exactamente entre ambos archivos.
Use sintaxis dotenv; las comillas permiten conservar espacios o un `#` que forme
parte del valor. Guarde los usuarios y contraseñas sólo en `.env.manual.local`;
no los escriba en el JSON ni en las plantillas versionadas. Las dos copias locales
están ignoradas por Git y fuera del despliegue.

## 7. Comprobar y ejecutar

Con Vue y la API funcionando, genere el manual de `cuenta-01`:

```bash
npm run docs:manuals -- --mode live --profile cuenta-01 --format ambos
```

`--profile` corresponde al `id` escrito en el JSON. Para generar los manuales de
todas las cuentas de ese archivo:

```bash
npm run docs:manuals -- --mode live --all --format ambos
```

El comando comprueba la configuración y autentica cada cuenta antes de capturar.
Sólo procesa las cuentas de su lista; no busca otros usuarios del sistema.

Para revisar el procedimiento sin usar cuentas reales:

```bash
npm run docs:manuals -- --mode demo --profile instalaciones-instalador --format ambos
```

El modo `demo` no lee sus credenciales locales y prepara sus propios datos ficticios.
Para revisar todos los perfiles de demostración, sustituya `--profile instalaciones-instalador`
por `--all`. Este modo permite revisar los manuales sin cuentas reales; no demuestra
los permisos ni los datos de una instalación real. Para obtener sólo fuentes y
capturas sin Word/PDF, añada `--capture-only`.

## 8. Entender los archivos generados

| Ruta bajo `front/` | Para qué sirve y cuándo aparece |
| --- | --- |
| `build/manuals/<perfil>/sources/index.md` | Portada, alcance e índice de la edición por cuenta. Lo crea la herramienta después de obtener su acceso. |
| `build/manuals/<perfil>/sources/*.md` | Capítulos filtrados, incluido el glosario. Se regeneran desde `docs/user-manual`; las correcciones se hacen en esas fuentes originales. |
| `build/manuals/<perfil>/images/*.png` | Capturas de esa edición. En `live` muestran los datos visibles para la cuenta de capacitación. |
| `build/manuals/<perfil>/manifest.json` | Estado `pending` o `ready`, permisos, fuentes, capturas y huellas para comprobar vigencia y reanudación. No se completa a mano ni contiene la contraseña. |
| `build/docs/docx/manuales-vue/<perfil>/manual-<perfil>.docx` | Manual Word exportado cuando todas las capturas requeridas están completas. |
| `build/docs/pdf/manuales-vue/<perfil>/manual-<perfil>.pdf` | Manual PDF si se solicitó `pdf` o `ambos` y terminó la conversión. |
| `build/test-results/manual-profiles.xml` | Reporte de ejecución del recorrido; ayuda a identificar un fallo. No es el manual para distribuir. |

Para el ejemplo mínimo, `<perfil>` se sustituye por `cuenta-01`. Los
resultados de `build/` son locales e ignorados. La herramienta autentica con una
sesión nueva y conserva cookies/tokens en memoria; no hay que generar un archivo
de sesión ni copiar cookies del navegador.

## 9. Reanudar y localizar un problema

```bash
npm run docs:manuals -- --mode live --profile cuenta-01 --missing --format ambos
```

`--missing` conserva capturas completas cuando coinciden cuenta, acceso, modo,
fuentes y código del recorrido, y cuando el PNG conserva su huella. Completa las
pendientes o las que ya no coinciden. Sin esa opción se recaptura el perfil completo.
`--capture-only` prepara fuentes e imágenes sin invocar Pandoc/LibreOffice.

| Situación | Comprobación y recuperación |
| --- | --- |
| No autentica | Revisar servicio, cuenta y variables locales sin imprimir sus valores. |
| Cuenta distinta del perfil | Revisar `expectedAccess`, área/rol real y referencia de credenciales. |
| Una tabla está vacía | La captura de consulta puede ser válida. Para una edición hace falta un registro existente; preparar datos de capacitación. |
| No encuentra una opción | Revisar dependencias del selector, registros activos y permisos. Para la captura de pesos se necesita un material de referencia ROLLO. |
| No aparece una devolución | Se necesita permiso de Almacén y una salida existente en estado surtido. No se surte automáticamente para preparar la foto. |
| Falla un selector o recorrido | Consultar el nombre de imagen y motivo en `manifest.json`; corregir preparación o recorrido y reanudar. |
| Intenta una escritura de negocio | El recorrido falla; revisar la automatización, no habilitar el envío para obtener la captura. |
| Cambió el acceso | Volver a autenticar y regenerar la edición de ese perfil. |
| Cambió un PNG | Se vuelve a capturar; una imagen alterada no se publica como verificada. |
| Falla DOCX/PDF | Revisar Pandoc/LibreOffice y el código de salida. No considerar actualizados los documentos de una corrida anterior. |


## 10. Revisar y distribuir

Abra el DOCX y el PDF y compruebe:

1. Que el título, las áreas y los roles corresponden a la cuenta utilizada.
2. Que el índice y las tareas muestran las funciones que esa cuenta puede utilizar.
3. Que los pasos, etiquetas, advertencias y opciones de recuperación coinciden con las pantallas.
4. Que las capturas y las tablas se leen completas, sin recortes.
5. Que los datos visibles pueden compartirse con los destinatarios del manual.

Distribuya los documentos por el canal autorizado. Las fuentes y resultados
permanecen fuera del despliegue; no los copie a `public/` ni a `dist/`.
Una ejecución correcta no sustituye esta revisión. El estado editorial permanece
En revisión hasta su aceptación.

Si la ejecución falla, revise `manifest.json` y la terminal: un PDF de una corrida
anterior no demuestra que la generación actual haya terminado. Las comprobaciones
internas de sesión y captura están descritas en
[Funcionamiento del generador](06-manuals-by-access.md#garantías-durante-la-captura).

## Opciones adicionales

- `expectedAccess`: comprobación opcional de rol y área. Algunas entradas de la
  plantilla la incluyen; puede omitirla como en el ejemplo mínimo. No asigna permisos.
- Variables del proceso/CI: pueden sustituir `.env.manual.local` y tienen prioridad
  sobre sus valores. Revise esta opción si editar el archivo no cambia las credenciales usadas.
- `--accounts` y `--env-file`: permiten indicar otros archivos de cuentas y credenciales.
