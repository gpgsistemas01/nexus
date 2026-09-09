# Inventario de capturas del manual de usuario

## Criterio de identificación y orden

Cada captura tiene un identificador estable `CAP-<grupo>-<ámbito>-<paso>-<estado>`. El
identificador permite relacionarla con uno o más casos de uso sin depender del nombre del
archivo. Ese mismo identificador se publica como ancla junto a la imagen en los
[procedimientos del manual](procedures.md), de modo que puede citarse como, por ejemplo,
`cases/catalogs.md#CAP-CAT-MAT-02-CREATE`. La ruta conserva el patrón
`images/<módulo>/NN-descripcion.png`: `NN` expresa el orden
en que el lector recorre el módulo, desde el listado hacia la captura de datos, la edición, las
operaciones que modifican existencias y, al final, la exportación.

Una misma imagen se reutiliza cuando la interfaz es realmente la misma. Por ejemplo, el listado
muestra tanto la consulta como el punto de entrada de una exportación directa. No se crean
capturas duplicadas para cada caso de uso ni imágenes de un archivo Excel descargado.
Cuando un listado dispone de un panel **Filtros**, su captura inicial lo muestra desplegado para
que el usuario pueda ubicar los campos y las acciones descritas en el procedimiento.
Cuando un procedimiento requiere sustituir un filtro predeterminado, se incluye además una captura
del valor nuevo ya aplicado y de los resultados que habilitan el paso siguiente.

## Inventario automatizado

La siguiente tabla refleja el arreglo `captures` de `scripts/captureManualScreenshots.js`. Para
comprobar el inventario sin iniciar Nexus ni Playwright se ejecuta
`node scripts/captureManualScreenshots.js --list`.

| Orden | ID | Ruta | Casos de uso |
|---:|---|---|---|
| 1 | `CAP-AUT-01-LOGIN` | `docs/user-manual/images/acceso/01-inicio-sesion.png` | `CU-AUT-01` |
| 2 | `CAP-CAT-MAT-01-LIST` | `docs/user-manual/images/materiales/01-listado-inventario.png` | `CU-AUT-02`, `CU-CAT-01`, `CU-REP-01`, `CU-REP-03` |
| 3 | `CAP-CAT-MAT-02-CREATE` | `docs/user-manual/images/materiales/02-formulario-alta.png` | `CU-CAT-02`, `CU-CAT-17`, `CU-CAT-18` |
| 4 | `CAP-CAT-MAT-03-EDIT` | `docs/user-manual/images/materiales/03-formulario-edicion.png` | `CU-CAT-03`, `CU-CAT-04` |
| 5 | `CAP-CAT-MAT-04-STOCK` | `docs/user-manual/images/materiales/04-ajuste-existencia.png` | `CU-CAT-05`, `CU-CAT-19` |
| 6 | `CAP-REP-MAT-05-EXPORT` | `docs/user-manual/images/materiales/05-exportar-reporte.png` | `CU-REP-03` |
| 7 | `CAP-CAT-SUP-01-LIST` | `docs/user-manual/images/proveedores/01-listado.png` | `CU-CAT-06`, `CU-REP-12` |
| 8 | `CAP-CAT-SUP-02-CREATE` | `docs/user-manual/images/proveedores/02-formulario-alta.png` | `CU-CAT-07` |
| 9 | `CAP-CAT-SUP-03-EDIT` | `docs/user-manual/images/proveedores/03-formulario-edicion-y-estado.png` | `CU-CAT-08`, `CU-CAT-09` |
| 10 | `CAP-CAT-CLI-01-LIST` | `docs/user-manual/images/clientes/01-listado.png` | `CU-CAT-10`, `CU-REP-13` |
| 11 | `CAP-CAT-CLI-02-CREATE` | `docs/user-manual/images/clientes/02-formulario-alta.png` | `CU-CAT-11` |
| 12 | `CAP-CAT-CLI-03-EDIT` | `docs/user-manual/images/clientes/03-formulario-edicion.png` | `CU-CAT-12` |
| 13 | `CAP-CAT-WAS-01-LIST` | `docs/user-manual/images/mermas/01-listado-inventario.png` | `CU-CAT-13`, `CU-REP-06`, `CU-REP-09` |
| 14 | `CAP-CAT-WAS-02-CREATE` | `docs/user-manual/images/mermas/02-formulario-registro.png` | `CU-CAT-14` |
| 15 | `CAP-CAT-WAS-03-EDIT` | `docs/user-manual/images/mermas/03-formulario-edicion.png` | `CU-CAT-15` |
| 16 | `CAP-CAT-WAS-04-STOCK` | `docs/user-manual/images/mermas/04-ajuste-existencia.png` | `CU-CAT-16` |
| 17 | `CAP-REP-WAS-05-EXPORT` | `docs/user-manual/images/mermas/05-exportar-reporte.png` | `CU-REP-09` |
| 18 | `CAP-ENT-01-LIST` | `docs/user-manual/images/compras/01-listado.png` | `CU-ENT-01` |
| 19 | `CAP-ENT-02-CREATE` | `docs/user-manual/images/compras/02-formulario-registro.png` | `CU-ENT-02` |
| 20 | `CAP-ENT-03-EDIT` | `docs/user-manual/images/compras/03-edicion-compra.png` | `CU-ENT-03`, `CU-ENT-05` |
| 21 | `CAP-ENT-04-CORRECT` | `docs/user-manual/images/compras/04-correccion-detalle.png` | `CU-ENT-04` |
| 22 | `CAP-REP-ENT-05-EXPORT` | `docs/user-manual/images/compras/05-exportar-reporte.png` | `CU-REP-11` |
| 23 | `CAP-SAL-MAT-01-LIST` | `docs/user-manual/images/salidas-material/01-listado.png` | `CU-CAT-20`, `CU-SAL-01` |
| 24 | `CAP-SAL-MAT-02-CREATE` | `docs/user-manual/images/salidas-material/02-formulario-registro.png` | `CU-SAL-02` |
| 25 | `CAP-SAL-MAT-03-EDIT` | `docs/user-manual/images/salidas-material/03-edicion-encabezado.png` | `CU-SAL-03`, `CU-SAL-04` |
| 26 | `CAP-SAL-MAT-04-SUPPLY` | `docs/user-manual/images/salidas-material/04-surtir-detalles.png` | `CU-SAL-05` |
| 27 | `CAP-SAL-MAT-05-RETURN` | `docs/user-manual/images/salidas-material/05-devolver-detalle.png` | `CU-SAL-06` |
| 28 | `CAP-REP-SAL-MAT-06-EXPORT` | `docs/user-manual/images/salidas-material/06-exportar-reporte.png` | `CU-REP-04` |
| 29 | `CAP-SAL-MAT-07-FILTER` | `docs/user-manual/images/salidas-material/07-filtro-surtido.png` | `CU-SAL-01`, `CU-SAL-06` |
| 30 | `CAP-SAL-WAS-01-LIST` | `docs/user-manual/images/salidas-merma/01-listado.png` | `CU-SAL-07`, `CU-REP-08` |
| 31 | `CAP-SAL-WAS-02-CREATE` | `docs/user-manual/images/salidas-merma/02-formulario-registro.png` | `CU-SAL-08` |
| 32 | `CAP-SAL-WAS-03-EDIT` | `docs/user-manual/images/salidas-merma/03-edicion-encabezado.png` | `CU-SAL-09`, `CU-SAL-10` |
| 33 | `CAP-SAL-WAS-04-SUPPLY` | `docs/user-manual/images/salidas-merma/04-surtir-detalles.png` | `CU-SAL-11` |
| 34 | `CAP-SAL-WAS-05-RETURN` | `docs/user-manual/images/salidas-merma/05-devolver-detalle.png` | `CU-SAL-12` |
| 35 | `CAP-REP-SAL-WAS-06-EXPORT` | `docs/user-manual/images/salidas-merma/06-exportar-reporte.png` | `CU-REP-08` |
| 36 | `CAP-SAL-WAS-07-FILTER` | `docs/user-manual/images/salidas-merma/07-filtro-surtido.png` | `CU-SAL-07`, `CU-SAL-12` |
| 37 | `CAP-IDA-PER-01-LIST` | `docs/user-manual/images/personas/01-listado.png` | `CU-IDA-01`, `CU-REP-14` |
| 38 | `CAP-IDA-PER-02-CREATE` | `docs/user-manual/images/personas/02-formulario-alta.png` | `CU-IDA-02`, `CU-IDA-08`, `CU-IDA-09` |
| 39 | `CAP-IDA-PER-03-EDIT` | `docs/user-manual/images/personas/03-formulario-edicion.png` | `CU-IDA-03` |
| 40 | `CAP-IDA-USR-01-LIST` | `docs/user-manual/images/usuarios/01-listado.png` | `CU-IDA-04`, `CU-REP-15` |
| 41 | `CAP-IDA-USR-02-CREATE` | `docs/user-manual/images/usuarios/02-formulario-alta.png` | `CU-IDA-05` |
| 42 | `CAP-IDA-USR-03-EDIT` | `docs/user-manual/images/usuarios/03-formulario-edicion.png` | `CU-IDA-06` |
| 43 | `CAP-IDA-USR-04-PASSWORD` | `docs/user-manual/images/usuarios/04-cambio-contrasena.png` | `CU-IDA-07` |
| 44 | `CAP-REP-MOV-MAT-01-LIST` | `docs/user-manual/images/movimientos-material/01-historial-y-filtros.png` | `CU-REP-02` |
| 45 | `CAP-REP-MOV-MAT-02-EXPORT` | `docs/user-manual/images/movimientos-material/02-exportar-reporte.png` | `CU-REP-05` |
| 46 | `CAP-REP-MOV-WAS-01-LIST` | `docs/user-manual/images/movimientos-merma/01-historial-y-filtros.png` | `CU-REP-07` |
| 47 | `CAP-REP-MOV-WAS-02-EXPORT` | `docs/user-manual/images/movimientos-merma/02-exportar-reporte.png` | `CU-REP-10` |
| 48 | `CAP-ERR-404-NOT-FOUND` | `docs/user-manual/images/errores/01-pagina-no-encontrada.png` | Transversal |

## Cobertura adicional necesaria

Además de las pantallas nombradas directamente por el recorrido principal, el inventario incluye
estados necesarios para explicar decisiones y consecuencias del proceso:

- formularios de **edición**, porque muestran qué información permanece modificable después del
  alta;
- pantallas de **ajuste de existencia**, **surtido**, **devolución**, **corrección** y
  **cancelación**, porque estas acciones afectan inventario o el estado de un documento;
- filtros y, sólo en los reportes que lo ofrecen, diálogos de alcance, porque determinan qué
  información se descarga;
- la navegación autenticada, que muestra dónde cerrar sesión y cubre `CU-AUT-02` sin capturar ni
  publicar credenciales;
- los catálogos auxiliares de roles, departamentos, presentaciones, unidades, motivos y estados
  dentro de los formularios donde se consumen (`CU-IDA-08`, `CU-IDA-09` y `CU-CAT-17` a
  `CU-CAT-20`), ya que no tienen una vista web independiente.

Los inventarios de materiales y mermas abren un diálogo específico de alcance: **Activos o con
existencia**, **Sólo activos** o **Sólo con existencia**. Se documentan mediante
`CAP-REP-MAT-05-EXPORT` y `CAP-REP-WAS-05-EXPORT`. Los reportes mensuales de compras, salidas y
movimientos conservan su diálogo de mes o filtros aplicados. Proveedores, clientes, personas y
usuarios continúan con descarga directa y reutilizan la captura del listado.

Una línea con el formato `CAP-* -> ruta.png [...]` confirma que esa captura ya fue escrita. Para
los inventarios, el modal debe aparecer antes de esa línea; así la captura representa la selección
del alcance y no un mensaje posterior a la descarga.

## Datos de prueba requeridos

La automatización no crea ni modifica registros. El estado de prueba usado para las capturas debe
pertenecer a una cuenta ficticia con todos los permisos que se documentan y contener, como mínimo:

1. un material y una merma activos que admitan edición y ajuste;
2. una compra abierta con un detalle corregible y cancelable;
3. una salida aprobada y pendiente o parcial para mostrar el surtido de material, y **otra salida
   distinta**, aprobada y completamente surtida, con cantidad aún retornable para mostrar la
   devolución; abrir el modal de surtimiento durante la captura no modifica el primer registro;
4. los estados equivalentes para una salida de merma;
5. al menos una persona, un usuario, un proveedor y un cliente editables;
6. movimientos de material y merma para que los historiales no aparezcan vacíos.

El script recorre todas las páginas del listado filtrado para localizar cada acción visible; el
registro requerido no tiene que aparecer en la primera página y una copia oculta del control,
creada por la vista responsiva de la tabla, no impide seleccionar otra copia visible. Si no
encuentra la acción después de revisar la última página, falla inmediatamente con el identificador,
selector y prerrequisito que debe prepararse, sin esperar nuevamente el tiempo límite de
Playwright. Por ejemplo,
`.btn-return-detail` sólo aparece para una salida
aprobada y completamente surtida; una salida pendiente o parcialmente surtida muestra
`.btn-edit-detail` en su lugar. Este comportamiento es intencional: evita publicar una secuencia
incompleta o incoherente. Para las capturas de surtido, la automatización selecciona directamente
**Surtir detalle** después de acceder al módulo. Para las capturas de devolución, cambia el filtro
predeterminado **Pendiente** a **Surtido**, selecciona **Buscar / filtrar**, espera que terminen la
carga inicial y la actualización filtrada del listado, y sólo entonces busca `.btn-return-detail`,
tanto en salidas de material como de merma. Este recorrido reutiliza el mismo envío de filtros de
tabla usado en compras y los
demás listados. Para las vistas protegidas, el script inicia sesión automáticamente con
`DOCS_LOGIN_NAME` y `DOCS_LOGIN_PASSWORD`, o reutiliza `DOCS_STORAGE_STATE` como alternativa. La
automatización no obtiene ni guarda esas credenciales: Playwright las escribe directamente en el
formulario de acceso y conserva las cookies resultantes sólo en la memoria de su contexto mientras
genera las imágenes. No crea un archivo de sesión. `DOCS_STORAGE_STATE` permite leer un archivo de
sesión preparado previamente como mecanismo alternativo; nunca se genera a partir del usuario y la
contraseña. Estos valores sólo se leen del entorno del proceso, no se agregan al archivo `.env`, y
deben retirarse de la terminal al terminar, como indica la
[guía de exportación](../README.md#exportar-la-documentación). La pantalla de inicio de sesión se
toma en un contexto separado y sin autenticación.

Las líneas indentadas `Paso N/T de CAP-*` describen los filtros y clics necesarios para preparar
**una sola captura**; no indican que se haya escrito otro PNG. Sólo la línea sin sangría
`CAP-* -> ruta.png [...]` confirma la escritura. Después de corregir un prerrequisito puede
reintentarse únicamente la captura fallida, sin regenerar ni eliminar las que ya funcionaron:

```powershell
# PowerShell
$env:DOCS_CAPTURE_IDS = 'CAP-SAL-WAS-05-RETURN'
npm run docs:screenshots
Remove-Item Env:DOCS_CAPTURE_IDS
```

```bash
# Bash; se aceptan varios identificadores separados por comas.
DOCS_CAPTURE_IDS=CAP-SAL-WAS-05-RETURN npm run docs:screenshots
```

`npm run docs:screenshots` también comprueba, inicia y detiene una instancia local de Nexus. El
flujo reutiliza una instancia que ya responda en `DOCS_BASE_URL` y sólo detiene la que haya iniciado
él mismo; la selección mediante `DOCS_CAPTURE_IDS` permanece a cargo del mismo inventario.

## Revisión antes de publicar

Cada ejecución completa elimina `docs/user-manual/images/` después de validar la configuración y
antes de abrir el navegador. Así se retiran archivos obsoletos, incluso si ya no figuran en el
inventario. Una ejecución selectiva con `DOCS_CAPTURE_IDS` elimina y sustituye sólo los PNG
solicitados; si falla, las demás capturas se conservan. La opción `--list` es sólo de consulta y no
elimina archivos.

Después de ejecutar `npm run docs:screenshots`, se debe comprobar que los datos sean ficticios,
que no aparezcan contraseñas, cookies ni datos personales, que los textos sean legibles y que el
estado visible coincida con los casos de uso asignados en la tabla. Cada imagen debe corresponder
al área visible de 1440 × 1000 píxeles, sin agregar el contenido que queda debajo de la pantalla.
En los pasos con modal se conserva el contexto visible que lo rodea; no se recorta sólo el modal.
Sólo entonces las imágenes revisadas se referencian desde el recorrido correspondiente del
manual. Al completar todo el
inventario, si se proporcionó `DOCS_STORAGE_STATE`, el script elimina automáticamente ese archivo;
si la ejecución falla, lo conserva para permitir un reintento y debe eliminarse manualmente cuando
ya no se vaya a utilizar. Las credenciales automáticas sólo permanecen en las variables del proceso
y deben retirarse de la terminal después de generar las capturas.
