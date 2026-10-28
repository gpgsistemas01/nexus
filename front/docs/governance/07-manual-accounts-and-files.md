# 7. Preparar cuentas y archivos para los manuales

## Propósito y punto de partida

Esta guía está dirigida a quien prepara los manuales de capacitación. Explica
cómo obtener una cuenta, crear su configuración local y relacionar cada perfil
con sus credenciales. Los comandos se ejecutan desde **`front/`**, dentro del
repositorio completo. Si la terminal está en la raíz, entre con `cd front`.

## 1. Elegir el tipo de generación

| Necesidad | Comando o modo | Cuenta y archivos requeridos |
| --- | --- | --- |
| Revisar un manual por acceso con datos ficticios. | `docs:manuals -- --mode demo` | Perfiles incluidos en la herramienta; no necesita cuentas reales, JSON local ni contraseñas. Inicia su propio Vite en el puerto 5177. |
| Obtener un manual con las pantallas de una cuenta del entorno de capacitación. | `docs:manuals -- --mode live` | Cuenta existente, Vue/API funcionando y las dos configuraciones locales explicadas abajo, o variables del proceso para las credenciales. |
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

Las credenciales son las mismas que permiten ingresar a Nexus en el entorno de
capacitación. El generador no tiene una contraseña predeterminada ni crea usuarios.

1. Ingrese con una cuenta autorizada para administrar usuarios en ese entorno.
2. Abra **Identidad y acceso → Usuarios → Nuevo usuario**.
3. Capture **Usuario** y una **Contraseña** que cumpla las reglas del formulario.
   Puede crearla con el gestor de contraseñas de su organización. La herramienta
   de manuales no la elige ni la entrega.
4. Seleccione el **Área** y **Rol** de la cuenta que se va a documentar. Para el
   ejemplo de esta guía: **Instalaciones** e **Instalador**.
5. Pulse **Guardar** y compruebe la cuenta. Conserve sus credenciales por el medio
   autorizado para preparar la configuración local.
6. Verifique que puede ingresar con esa cuenta y que su menú corresponde a sus
   tareas. Luego cierre la sesión usada en esa comprobación.

Si la cuenta ya existe, solicite su acceso al responsable; no es necesario crearla
de nuevo. Si se desconoce la contraseña, no puede obtenerse del listado de Usuarios:
el responsable autorizado puede usar **Cambiar contraseña** y comunicar la nueva
clave. Ese cambio afecta también los siguientes ingresos de la cuenta. Los pasos
completos de alta, edición y cambio de clave están en [Usuarios](../user-manual/08-users.md).

Tener una Persona registrada no crea una cuenta de Usuario. Si el entorno aún no
tiene una cuenta administradora inicial, debe prepararla su responsable según el
procedimiento de instalación del servidor; el generador de manuales no realiza ese
aprovisionamiento. Para revisar manuales sin esa preparación, utilice `demo`.

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
pero no crea ni actualiza sus archivos locales. Si ya tenía una configuración de
Instalaciones, compruebe que utiliza `instalaciones-instalador`, `installer` y las
referencias `DOCS_FRONT_INSTALACIONES_INSTALADOR_*`.

## 5. Configurar el perfil en el JSON

Para preparar únicamente el manual de Instalador, éste es el contenido completo
de `manual.accounts.local.json`:

```json
{
    "baseUrl": "http://127.0.0.1:5173",
    "accounts": [
        {
            "id": "instalaciones-instalador",
            "label": "Instalaciones · Instalador",
            "expectedAccess": {
                "roleKey": "installer",
                "departmentKey": "installations"
            },
            "usernameEnv": "DOCS_FRONT_INSTALACIONES_INSTALADOR_USER",
            "passwordEnv": "DOCS_FRONT_INSTALACIONES_INSTALADOR_PASSWORD"
        }
    ]
}
```

| Campo | Significado y forma de completarlo |
| --- | --- |
| `baseUrl` | Origen del frontend que abrirá el navegador, sin ruta, parámetros ni credenciales. Use el origen donde funciona Vue; no el puerto directo de Express. Se admite HTTP en localhost o HTTPS. |
| `accounts` | Lista de perfiles que se pueden procesar. Conserve sólo las cuentas que va a preparar; cada entrada necesita sus credenciales. |
| `id` | Identificador del perfil documental, único en la lista. Usa minúsculas, números y guiones; determina `--profile` y las carpetas de resultados. No es el nombre de ingreso ni el identificador de la base de datos. |
| `label` | Nombre legible de la portada, por ejemplo «Instalaciones · Instalador». |
| `expectedAccess.roleKey` | Clave técnica del rol que debe tener la cuenta, como `installer`. |
| `expectedAccess.departmentKey` | Clave técnica del área que debe acompañar a ese rol en la misma asignación, como `installations`. |
| `usernameEnv` | Nombre de la variable que contiene el usuario de ingreso. Aquí se escribe `DOCS_FRONT_..._USER`, no el usuario real. |
| `passwordEnv` | Nombre de la variable que contiene su contraseña. Aquí se escribe `DOCS_FRONT_..._PASSWORD`, no la clave real. |

Las claves de rol y área de los otros perfiles están completas en la plantilla.
`expectedAccess` es opcional para la herramienta; se conserva en estos ejemplos
para detectar cuentas equivocadas. Comprueba la asignación de la sesión, pero no
otorga ese acceso ni elimina otros que la cuenta ya tenga. El contenido del manual
se selecciona con los permisos efectivos de todas sus asignaciones.

Para varias cuentas, agregue otras entradas dentro de `accounts`, separadas por
comas, con identificadores y referencias propios. El JSON no admite comentarios ni
comas al final de la lista. `--all` procesa esa lista; no descubre los usuarios
de Nexus ni crea automáticamente un manual por cada rol existente.

## 6. Completar las credenciales locales

En `.env.manual.local`, complete las variables referenciadas por el JSON. Ejemplo
de estructura; **sustituya los dos valores de muestra por los de la cuenta existente**:

```dotenv
DOCS_FRONT_INSTALACIONES_INSTALADOR_USER="USUARIO"
DOCS_FRONT_INSTALACIONES_INSTALADOR_PASSWORD="CONTRASENA"
```

| Relación | Ejemplo |
| --- | --- |
| Perfil documental | `id: instalaciones-instalador` → opción `--profile instalaciones-instalador`. |
| Referencia de usuario | `usernameEnv` → variable `DOCS_FRONT_INSTALACIONES_INSTALADOR_USER` → usuario real de Nexus. |
| Referencia de contraseña | `passwordEnv` → variable `DOCS_FRONT_INSTALACIONES_INSTALADOR_PASSWORD` → contraseña de esa misma cuenta. |

Los nombres de las variables deben coincidir exactamente entre ambos archivos.
Use sintaxis dotenv; las comillas permiten conservar espacios o un `#` que forme
parte del valor. La herramienta recorta espacios externos del usuario y conserva
los de la contraseña. No agregue credenciales al JSON ni a las plantillas versionadas.

Puede definir esas mismas variables en el entorno del proceso/CI en lugar de usar
el archivo de secretos. Las variables del proceso tienen prioridad: si una clave
antigua sigue definida en la terminal, editar `.env.manual.local` no la sustituye.
Para archivos con otros nombres, indique `--accounts` y `--env-file` explícitamente.
El archivo de credenciales puede faltar si todas las variables necesarias están en
el entorno; para `live` sigue siendo necesaria una configuración de cuentas válida.

## 7. Comprobar y ejecutar

Esta comprobación local valida la estructura del JSON y que cada referencia tenga
un valor. No imprime credenciales ni inicia sesión:

```bash
node --input-type=module -e "import { readAccounts, readCredentials } from './scripts/manual/profiles.mjs'; const { accounts } = await readAccounts('manual.accounts.local.json'); for (const account of accounts) await readCredentials(account, '.env.manual.local'); console.log('Configuración y variables completas.');"
```

El mensaje confirma que los archivos pueden leerse. La contraseña, la asignación
y la conexión se comprueban al autenticar en el siguiente paso. Para el ejemplo:

```bash
npm run docs:manuals -- --mode live --profile instalaciones-instalador --format ambos
```

Para revisar el procedimiento sin usar cuentas reales:

```bash
npm run docs:manuals -- --mode demo --profile instalaciones-instalador --format ambos
```

El modo `demo` no lee sus credenciales locales. Para obtener sólo fuentes y capturas
sin Word/PDF, añada `--capture-only`. La [guía de ejecución por acceso](06-manuals-by-access.md#reanudar-y-localizar-un-problema)
explica `--missing`, la reanudación y los rechazos de autenticación o permisos.

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

Para el ejemplo, `<perfil>` se sustituye por `instalaciones-instalador`. Los
resultados de `build/` son locales e ignorados. La herramienta autentica con una
sesión nueva y conserva cookies/tokens en memoria; no hay que generar un archivo
de sesión ni copiar cookies del navegador.

Abra DOCX/PDF y revise la cuenta de la portada, tareas, capturas y datos visibles
antes de distribuirlos por el canal documental autorizado. Si la ejecución falla,
revise `manifest.json` y la terminal: un PDF de una corrida anterior no demuestra
que la generación actual haya terminado.
