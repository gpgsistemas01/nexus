# 8. Actualizar las capturas del manual

Este flujo sólo se ejecuta en un clon sin las imágenes requeridas o cuando una pantalla cambió.
Su resultado son archivos PNG revisables en `build/docs/screenshots/`; **no genera DOCX ni PDF**
ni modifica los binarios versionados del manual. `build/` está ignorado por Git, por lo que las
capturas se publican como artefactos del entorno o de CI sin incorporarlas al diff de una solicitud
de cambio. Después de revisarlas, vuelva a [Exportar los manuales](#exportar-los-manuales).

El comando `npm run docs:screenshots` automatiza el ciclo de la aplicación: comprueba
`DOCS_BASE_URL`, inicia una instancia temporal de Nexus cuando no existe una, espera a que responda,
ejecuta el mismo inventario de capturas y detiene únicamente la instancia que inició. Si Nexus ya
está disponible, la reutiliza y no la detiene. La base con datos ficticios y las credenciales siguen
siendo prerrequisitos explícitos, porque el comando no debe crear datos ni guardar secretos.
Playwright y Chromium se preparan automáticamente en el mismo entorno antes de iniciar Nexus.

1. Prepare una base de prueba con los permisos y registros ficticios de
   [Datos de prueba requeridos](user-manual/screenshot-inventory.md#datos-de-prueba-requeridos).
   No utilice producción ni datos personales reales.
2. Complete la [configuración inicial de Nexus](../README.md#configuración-inicial). El comando
   automático puede iniciar y detener Nexus; si prefiere inspeccionar sus logs en otra terminal,
   inicie la aplicación manualmente:

   ```powershell
   # Terminal 1, PowerShell o Bash
   npm run dev
   ```

   Mantenga esta terminal abierta y espere el mensaje `Servidor escuchando en puerto 3000`.
3. El comando automático comprueba la página de inicio de sesión y espera hasta 30 segundos cuando
   inicia Nexus. Si administra la aplicación manualmente, abra la terminal 2 y compruébela antes de
   continuar:

   ```powershell
   # Terminal 2, PowerShell
   Invoke-WebRequest -UseBasicParsing "http://127.0.0.1:3000/inicio-sesion"
   ```

   ```bash
   # Terminal 2, Bash
   curl --fail http://127.0.0.1:3000/inicio-sesion
   ```

   Si Nexus usa otro puerto, sustitúyalo en esta URL y después en `DOCS_BASE_URL`.
4. En la terminal 2, defina `DOCS_BASE_URL` y las credenciales ficticias del área que va a
   capturar. No agregue `/inicio-sesion` a `DOCS_BASE_URL`.

   ```powershell
   # PowerShell
   $env:DOCS_BASE_URL = "http://127.0.0.1:3000"
   $env:DOCS_ALMACEN_LOGIN_NAME = "usuario-ficticio"
   $env:DOCS_ALMACEN_LOGIN_PASSWORD = "contraseña-ficticia"
   ```

   ```bash
   # Bash
   export DOCS_BASE_URL=http://127.0.0.1:3000
   export DOCS_ALMACEN_LOGIN_NAME=usuario-ficticio
   export DOCS_ALMACEN_LOGIN_PASSWORD='contraseña-ficticia'
   ```

   Para ejecutar después el área Sistemas, defina `DOCS_SISTEMAS_LOGIN_NAME` y
   `DOCS_SISTEMAS_LOGIN_PASSWORD` con su cuenta ficticia. No reutilice una cuenta entre áreas.
   Como alternativa, cada área admite su propio
   `DOCS_ALMACEN_STORAGE_STATE` o `DOCS_SISTEMAS_STORAGE_STATE`.

   No guarde estas credenciales en `.env` ni en archivos del repositorio. Cada ejecución incluye
   las pantallas sin sesión y las pantallas protegidas que corresponden al área seleccionada.

   Para capturas protegidas, como alternativa a las credenciales puede crear una sesión temporal
   con Playwright. Siga esta secuencia completa en PowerShell en lugar de definir
   `DOCS_ALMACEN_LOGIN_NAME` y `DOCS_ALMACEN_LOGIN_PASSWORD`:

   1. En la terminal 2, defina la URL, indique la ruta del archivo temporal e inicie `codegen`:

      ```powershell
      $env:DOCS_BASE_URL = "http://127.0.0.1:3000"
      $env:DOCS_ALMACEN_STORAGE_STATE = Join-Path $env:TEMP "nexus-storage-state.json"
      npx playwright codegen --save-storage="$env:DOCS_ALMACEN_STORAGE_STATE" "${env:DOCS_BASE_URL}/inicio-sesion"
      ```

   2. En la ventana de **Chromium** abierta por el tercer comando, complete el formulario de Nexus
      con datos ficticios y confirme que ya ve una pantalla protegida.
   3. Vuelva a la **terminal 2**, donde `codegen` continúa en ejecución, y presione `Ctrl+C` una vez.
      No lo haga en la terminal 1, porque esa terminal mantiene Nexus disponible para las capturas,
      y no finalice el proceso desde el Administrador de tareas ni con `Stop-Process`.
   4. Espere a que Playwright cierre Chromium, termine `codegen` y reaparezca el prompt. No cierre
      PowerShell ni ejecute todavía `npm run docs:screenshots`.
   5. Compruebe que Playwright haya guardado la sesión:

      ```powershell
      Test-Path "$env:DOCS_ALMACEN_STORAGE_STATE"
      ```

      Continúe únicamente si devuelve `True`; si devuelve `False`, repita esta secuencia desde el
      subpaso 1. Definir la variable por sí solo no crea el archivo. No mezcle
      `DOCS_ALMACEN_STORAGE_STATE` con las variables de credenciales.

   Es necesario completar los cinco subpasos y terminar `codegen` antes de iniciar las capturas:
   mientras sigue abierto, el archivo puede no estar guardado y la terminal 2 continúa ocupada.
5. Genere las capturas. El mismo comando incluye la comprobación, el arranque y la detención de
   Nexus en el proceso:

   ```bash
   npm run docs:screenshots -- --area almacen
   npm run docs:screenshots -- --area sistemas
   ```

   Si Nexus ya se administra por separado, el comando reutiliza esa instancia y no la detiene.
   Cada comando genera únicamente el inventario de su área y usa exclusivamente sus credenciales;
   una pantalla presente en ambas áreas se captura dos veces porque la sesión determina los botones,
   acciones y permisos visibles. Las pantallas sin sesión también se guardan dentro de esa misma
   área. `DOCS_CAPTURE_AREA` queda
   disponible como alternativa equivalente para automatización de CI. `DOCS_ALMACEN_CAPTURE_IDS` o
   `DOCS_SISTEMAS_CAPTURE_IDS`, según el área, permite ejecutar sólo las capturas seleccionadas. Si una
   ejecución se interrumpe, vuelva a ejecutar el mismo comando: detectará la primera captura ausente,
   informará desde cuál reanuda y conservará las imágenes anteriores. La variable
   `DOCS_<AREA>_CAPTURE_FROM=CAP-*` permite elegir explícitamente otro punto. Para regenerar sólo los
   PNG ausentes, agregue `--missing` al comando del área. No combine mecanismos de selección.

   Agregue `--fresh` al comando de un área sólo cuando necesite regenerar deliberadamente ese grupo.
6. Espere el mensaje `Capturas generadas` y a que reaparezca el prompt de la terminal 2. En ese
   momento, el script ya cerró Playwright y Chromium automáticamente y puede usar el siguiente
   comando.
7. Revise los PNG conforme a
   [Revisión antes de publicar](user-manual/screenshot-inventory.md#revisión-antes-de-publicar).
   Si debe corregir el entorno, repita los pasos 5 a 7.
8. Retire de la terminal 2 las variables del mecanismo que haya utilizado. Las variables se
   definieron manualmente en PowerShell o Bash y **no se eliminan automáticamente** cuando terminan
   `codegen` o el comando de capturas:

   ```powershell
   # PowerShell
   Remove-Item Env:DOCS_ALMACEN_LOGIN_NAME, Env:DOCS_ALMACEN_LOGIN_PASSWORD
   ```

   ```powershell
   # PowerShell, si utilizó el archivo de sesión
   Remove-Item Env:DOCS_ALMACEN_STORAGE_STATE
   ```

   ```bash
   # Bash
   unset DOCS_ALMACEN_LOGIN_NAME DOCS_ALMACEN_LOGIN_PASSWORD
   ```

   Hay dos elementos distintos: la variable `DOCS_ALMACEN_STORAGE_STATE` permanece definida en la terminal
   hasta ejecutar `Remove-Item`, mientras que el archivo JSON al que apunta sí lo elimina
   automáticamente una ejecución correcta de `npm run docs:screenshots`. Si la ejecución falla, el
   archivo se conserva para reintentar y debe eliminarse manualmente cuando ya no se vaya a usar.
   Retire la variable aunque el archivo ya haya sido eliminado para que una ejecución futura no
   apunte a una ruta inexistente.
9. Si inició Nexus manualmente en la terminal 1, presione `Ctrl+C` y espere el prompt para
    detener Nexus/Nodemon. El comando automático ya detuvo su instancia temporal.
10. Exporte el manual del actor en DOCX:

   ```bash
   npm run docs:export -- manual-administrador --check
   npm run docs:export -- manual-administrador docx
   ```

El límite de 30 segundos de Playwright es el tiempo máximo para que una condición de la página se
cumpla, no una pausa que el proceso deba consumir en cada captura. Cuando se agota, cada reintento
abre una página nueva desde la ruta inicial para descartar el estado incompleto del intento anterior.
Si la comprobación del paso 3
responde `ERR_CONNECTION_REFUSED`, confirme que Nexus siga activo y
que la URL use el puerto anunciado. Si la captura falla esperando el botón **Nueva salida** de
salidas de merma, compruebe que la cuenta tenga `waste:issues-manage`; el acceso al listado por sí
solo no sustituye el permiso de administración. Si falla esperando `.btn-return-detail`, compruebe
el permiso de surtimiento y que exista una salida aprobada, completamente surtida y con cantidad
retornable. El script espera a que DataTables termine de cargar y recorre todas las páginas del
listado para localizar la acción requerida. Las líneas `Paso N/T`
son acciones preparatorias, no capturas duplicadas. Después de corregir los datos puede definir
`DOCS_ALMACEN_CAPTURE_IDS=CAP-SAL-WAS-05-RETURN` y ejecute con `--area almacen` para regenerar
sólo la captura fallida, o use `DOCS_ALMACEN_CAPTURE_FROM=CAP-SAL-WAS-05-RETURN` con la misma
área para continuar con ella y todas las posteriores; ambos
mecanismos conservan las demás imágenes.


## Precisión de la interacción automatizada

Playwright debe localizar el control funcional mediante selectores estables, texto accesible y el
estado visible que confirma la transición. No se registran coordenadas ni una zona exacta en
píxeles: ese nivel de precisión se rompe con el diseño responsivo. Cada captura conserva el área
completa de 1440 × 1000 para que el lector vea el control, el modal o listado resultante y su
contexto. El inventario coloca todas las capturas en
`build/docs/screenshots/areas/<área>/<módulo>/...`, incluidas
las pantallas previas a la autenticación. Las pantallas compartidas se repiten por área para mostrar
la interfaz que realmente produce cada sesión. Cada área se ejecuta con un contexto autenticado
independiente y nunca escribe imágenes en la carpeta de otra área.
