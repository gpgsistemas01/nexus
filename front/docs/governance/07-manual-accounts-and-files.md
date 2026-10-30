# 7. Generar manuales por cuenta

Para generar un manual, use el usuario y la contraseña habituales de la cuenta.
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
| Revisar ediciones ficticias | `docs:manuals -- --mode demo --all` | Perfiles incluidos; no usa cuentas ni archivos locales. Inicia Vite en el puerto 5177. |
| Generar por cuentas existentes | `docs:manuals -- --mode live --all` | Vue/API funcionando, cuentas y los dos archivos locales. |
| Publicar el manual general | `docs:manual -- ambos` | Fuentes e imágenes de `docs/user-manual`; no selecciona por cuenta. |

Instalar dependencias y navegador:

```bash
npm ci --include=dev
npx playwright install chromium
```

Para Word/PDF, completar la [preparación del publicador](02-generation-and-publication.md#preparación-del-publicador).
En `live`, iniciar Vue y la API con la [guía local](../development/01-getting-started.md);
la herramienta no los arranca. Para un sitio remoto, usar su dirección HTTPS.

## 2. Qué contiene cada archivo de entrada

Rutas relativas a `front/`:

| Archivo | Función |
| --- | --- |
| [manual.accounts.example.json](../../manual.accounts.example.json) | Plantilla versionada: perfiles de referencia, dirección de Vue, accesos esperados y nombres de variables. Sin credenciales. |
| `manual.accounts.local.json` | Copia local: dirección de Vue y cuentas que se procesarán. Predeterminado de `--accounts`; no crea usuarios. |
| [.env.manual.example](../../.env.manual.example) | Plantilla versionada con variables vacías para usuarios y contraseñas. |
| `.env.manual.local` | Credenciales reales de todas las cuentas configuradas. Predeterminado de `--env-file`. |

`front/.env.local` configura Vite y `back/.env` configura la API; las credenciales
de manuales no van en esos archivos. Las variables `DOCS_FRONT_*` pertenecen a la
herramienta, no llevan `VITE_` ni se compilan en el navegador.

## 3. Obtener el usuario y la contraseña

Si la cuenta ya permite ingresar a Nexus, continuar en el paso 4. Si falta la
cuenta o su contraseña, acudir al responsable de usuarios; el procedimiento está
en [Usuarios](../user-manual/08-users.md).

Para `live`, preparar también registros de capacitación: una edición requiere un
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
| `baseUrl` | Origen de Vue, no el puerto directo de la API. Sin ruta, parámetros ni credenciales. HTTP sólo en localhost; HTTPS para un sitio remoto. |
| `accounts` | Lista de cuentas que se procesarán. Cada entrada necesita sus credenciales. |
| `id` | Identificador documental único, con letra minúscula inicial, minúsculas, números y guiones. Determina `--profile` y la carpeta; no es el usuario de ingreso ni el ID de base de datos. |
| `label` | Nombre legible de la edición; no asigna permisos. |
| `usernameEnv`, `passwordEnv` | Nombres de variables `DOCS_FRONT_*`; los valores reales van en `.env.manual.local`. |

### Distinguir varias ediciones

Agregar un bloque por cuenta, con otro `id`, `label` y variables; por ejemplo,
`cuenta-02`, `DOCS_FRONT_CUENTA_02_USER` y `DOCS_FRONT_CUENTA_02_PASSWORD`.
Separar los bloques con coma, sin coma final, y agregar sus credenciales al mismo
`.env.manual.local`.

Cada cuenta inicia una sesión independiente y tiene su propia carpeta. El manual
muestra las áreas y roles detectados e incluye la unión de sus tareas permitidas.
Dos cuentas con los mismos permisos pueden tener las mismas secciones.

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

## 7. Comprobar y ejecutar

Con Vue y la API funcionando, generar una edición:

```bash
npm run docs:manuals -- --mode live --profile cuenta-01 --format ambos
```

`--profile` usa el `id` del JSON. Para todas sus cuentas:

```bash
npm run docs:manuals -- --mode live --all --format ambos
```

La herramienta valida y autentica las cuentas de esa lista; no busca otros usuarios.
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
| `build/manuals/<perfil>/sources/index.md` | Portada, alcance e índice de la cuenta. |
| `build/manuals/<perfil>/sources/*.md` | Capítulos filtrados y glosario. Corregir sus originales en `docs/user-manual`; se regeneran. |
| `build/manuals/<perfil>/images/*.png` | Capturas propias; en `live`, muestran los datos visibles para esa cuenta. |
| `build/manuals/<perfil>/manifest.json` | Estado `pending`/`ready`, permisos, fuentes y huellas de vigencia y reanudación. No editar a mano; no contiene contraseñas. |
| `build/docs/docx/manuales-vue/<perfil>/manual-<perfil>.docx` | Word, después de completar las capturas requeridas. |
| `build/docs/pdf/manuales-vue/<perfil>/manual-<perfil>.pdf` | PDF, si se solicitó y terminó la conversión. |
| `build/test-results/manual-profiles.xml` | Reporte del recorrido para diagnosticar fallos; no es el manual. |

En el ejemplo, `<perfil>` es `cuenta-01`. Cookies y tokens permanecen en memoria;
no se necesita un archivo de sesión ni copiar cookies del navegador.

## 9. Reanudar y localizar un problema

```bash
npm run docs:manuals -- --mode live --profile cuenta-01 --missing --format ambos
```

`--missing` conserva capturas cuando coinciden cuenta, acceso, modo, fuentes,
código del recorrido y huella del PNG; completa las pendientes o desactualizadas.
Sin esa opción, se recaptura el perfil completo.

| Situación | Recuperación |
| --- | --- |
| No autentica | Revisar servicios, cuenta y variables locales sin imprimir valores. |
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
