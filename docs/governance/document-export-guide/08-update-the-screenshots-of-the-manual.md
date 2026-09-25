# 8. Actualizar las capturas del manual

La exportación de los manuales y la generación de capturas son procesos separados:

- `npm run docs:export -- todos <formato>` genera los dos manuales y el resto de la documentación
  exportable. Usa las imágenes ya versionadas y referenciadas bajo `docs/user-manual/images/`; no
  abre Nexus ni toma capturas nuevas.
- `npm run docs:screenshots -- --area <área>` genera PNG revisables bajo
  `build/docs/screenshots/areas/<área>/`. No genera DOCX o PDF y no modifica las imágenes
  versionadas. `build/` está ignorado por Git, por lo que las capturas pueden conservarse y
  entregarse como artefactos separados.

## Exportar todos los documentos

Valide primero todos los paquetes y genere el formato requerido igual que para el resto de la
documentación:

```powershell
npm run docs:export -- todos --check
npm run docs:export -- todos docx
```

Puede sustituir `docx` por `pdf` o `ambos`. Este paso es independiente de las sesiones de
Playwright: no requiere iniciar Nexus, preparar una base de datos ni definir variables
`DOCS_*_STORAGE_STATE`.

## Generar las capturas por área

Las capturas protegidas se obtienen por separado para **Almacén** y **Sistemas**, porque cada sesión
determina los menús, botones y permisos visibles. El flujo recomendado consiste en preparar un
archivo de sesión temporal con Playwright para un área y ejecutar inmediatamente sus capturas.

Antes de comenzar:

1. Prepare una base de prueba con los permisos y registros ficticios de
   [Datos de prueba requeridos](user-manual/screenshot-inventory.md#datos-de-prueba-requeridos) y
   complete la [configuración inicial de Nexus](../README.md#configuración-inicial). No utilice
   producción ni datos personales reales.
2. Desde la raíz del repositorio, inicie Nexus en una primera terminal y déjela abierta durante la
   preparación de las dos sesiones y las dos ejecuciones de capturas:

   ```powershell
   npm run dev
   ```

3. En una segunda terminal, compruebe que la página de acceso responda:

   ```powershell
   Invoke-WebRequest -UseBasicParsing "http://127.0.0.1:3000/inicio-sesion"
   ```

   Si Nexus usa otro puerto, ajuste el origen en los comandos siguientes. `DOCS_BASE_URL` debe
   contener sólo el origen, sin agregar `/inicio-sesion`.

### 1. Sesión y capturas de Almacén

En la segunda terminal de PowerShell, prepare el archivo de sesión de Almacén:

```powershell
$env:DOCS_BASE_URL = "http://127.0.0.1:3000"
$env:DOCS_WAREHOUSE_STORAGE_STATE = Join-Path $env:TEMP "nexus-warehouse-storage-state.json"
npx playwright codegen --save-storage="$env:DOCS_WAREHOUSE_STORAGE_STATE" "${env:DOCS_BASE_URL}/inicio-sesion"
```

En la ventana de Chromium abierta por `codegen`, inicie sesión con una cuenta ficticia del área
**Almacén** y confirme que se muestra una pantalla protegida. Después vuelva a la segunda terminal,
presione `Ctrl+C` una vez y espere a que Chromium se cierre y reaparezca el prompt. Compruebe que el
archivo fue escrito:

```powershell
Test-Path "$env:DOCS_WAREHOUSE_STORAGE_STATE"
```

Continúe sólo si el resultado es `True`. Genere entonces únicamente las capturas de esa área:

```powershell
npm run docs:screenshots -- --area almacen
```

El comando reutiliza la instancia de Nexus que está activa en la primera terminal y no la detiene.
También prepara Playwright y Chromium para la automatización, recorre el inventario de Almacén y
cierra sus propios contextos al terminar. Después de una ejecución correcta elimina el archivo JSON
temporal, pero la variable permanece definida; retírela antes de continuar:

```powershell
Remove-Item Env:DOCS_WAREHOUSE_STORAGE_STATE
```

### 2. Sesión y capturas de Sistemas

Sin detener Nexus, prepare una sesión nueva con una cuenta ficticia del área **Sistemas**. No
reutilice la sesión de Almacén:

```powershell
$env:DOCS_BASE_URL = "http://127.0.0.1:3000"
$env:DOCS_ADMIN_STORAGE_STATE = Join-Path $env:TEMP "nexus-admin-storage-state.json"
npx playwright codegen --save-storage="$env:DOCS_ADMIN_STORAGE_STATE" "${env:DOCS_BASE_URL}/inicio-sesion"
```

Complete el acceso en Chromium, presione `Ctrl+C` una vez en la segunda terminal, espere el prompt
y compruebe el archivo:

```powershell
Test-Path "$env:DOCS_ADMIN_STORAGE_STATE"
```

Si devuelve `True`, genere las capturas de Sistemas y retire la variable al terminar:

```powershell
npm run docs:screenshots -- --area sistemas
Remove-Item Env:DOCS_ADMIN_STORAGE_STATE
Remove-Item Env:DOCS_BASE_URL
```

Finalmente, detenga con `Ctrl+C` el proceso `npm run dev` de la primera terminal. Los resultados de
ambas áreas permanecen separados en:

```text
build/docs/screenshots/areas/almacen/
build/docs/screenshots/areas/sistemas/
```

Revise los PNG conforme a
[Revisión antes de publicar](user-manual/screenshot-inventory.md#revisión-antes-de-publicar). Una
pantalla compartida se captura una vez por área para conservar la interfaz que realmente produce
cada sesión.

## Reanudación y capturas selectivas

Cada comando genera únicamente el inventario del área indicada. `DOCS_CAPTURE_AREA` está disponible
como alternativa a `--area` para CI. Para regenerar capturas concretas use
`DOCS_ALMACEN_CAPTURE_IDS` o `DOCS_SISTEMAS_CAPTURE_IDS`; para continuar desde un punto use la
variable `DOCS_<AREA>_CAPTURE_FROM`. No combine esos mecanismos con `--missing` o `--fresh`.
Los listados independientes de clientes y proveedores pertenecen al inventario de Sistemas: no se
solicitan durante la ejecución de Almacén porque esa cuenta no tiene los permisos de vista de sus
rutas web.

Por ejemplo, para repetir una captura de Almacén con su archivo de sesión todavía disponible:

```powershell
$env:DOCS_ALMACEN_CAPTURE_IDS = 'CAP-SAL-WAS-05-RETURN'
npm run docs:screenshots -- --area almacen
Remove-Item Env:DOCS_ALMACEN_CAPTURE_IDS
```

Una ejecución normal detecta la primera captura ausente y conserva las anteriores. `--missing`
genera sólo los PNG ausentes y `--fresh` regenera deliberadamente todas las capturas del área.
Si la ejecución falla, el archivo de sesión no se elimina para permitir el reintento; elimínelo
manualmente cuando ya no se vaya a utilizar.

Como alternativa para automatización controlada, el script también acepta
`DOCS_WAREHOUSE_LOGIN_NAME` junto con `DOCS_WAREHOUSE_LOGIN_PASSWORD`, o `DOCS_ADMIN_LOGIN_NAME`
junto con `DOCS_ADMIN_LOGIN_PASSWORD`. No combine credenciales y `storage state` para una misma
área. El flujo interactivo con `codegen` es el procedimiento documentado para una actualización
manual de capturas.

El límite de 30 segundos de Playwright es el tiempo máximo para que una condición de la página se
cumpla, no una pausa obligatoria. Cuando se agota, cada reintento abre una página nueva desde la ruta
inicial. Si falla esperando el botón **Nueva salida** de salidas de merma, compruebe que la cuenta
tenga `waste:issues-manage`. Si falla esperando `.btn-return-detail`, compruebe el permiso de
surtimiento y que exista una salida aprobada, completamente surtida y con cantidad retornable. El
script espera a que DataTables termine de cargar y recorre todas las páginas del listado para
localizar la acción requerida. Las líneas `Paso N/T` son acciones preparatorias, no capturas
duplicadas.

Si Nexus redirige una ruta protegida al formulario de acceso, el script detiene esa captura sin
agotar los reintentos: vuelva a generar el archivo de sesión para la misma instancia indicada en
`DOCS_BASE_URL`, o revise las credenciales automáticas. Si en su lugar aparece la página de error,
compruebe que la cuenta del área tenga permiso para abrir la ruta indicada en el mensaje. Esto evita
confundir una sesión expirada o un permiso ausente con una carga lenta de DataTables.

## Precisión de la interacción automatizada

Playwright localiza los controles mediante selectores estables, texto accesible y el estado visible
que confirma la transición. No se registran coordenadas ni una zona exacta en píxeles. Cada captura
conserva el área completa de 1440 × 1000 para mostrar el control, el modal o listado resultante y su
contexto. Las pantallas previas a la autenticación también se guardan dentro de la carpeta del área
seleccionada. Cada ejecución usa un contexto independiente y nunca escribe imágenes en la carpeta
de otra área.
