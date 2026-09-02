# Inventario de capturas del manual de usuario

## Criterio de identificación y orden

Cada captura tiene un identificador estable `CAP-<grupo>-<ámbito>-<paso>-<estado>`. El
identificador permite relacionarla con uno o más casos de uso sin depender del nombre del
archivo. La ruta conserva el patrón `images/<módulo>/NN-descripcion.png`: `NN` expresa el orden
en que el lector recorre el módulo, desde el listado hacia la captura de datos, la edición, las
operaciones que modifican existencias y, al final, la exportación.

Una misma imagen se reutiliza cuando la interfaz es realmente la misma. Por ejemplo, el listado
muestra tanto la consulta como el punto de entrada de una exportación directa. No se crean
capturas duplicadas para cada caso de uso ni imágenes de un archivo Excel descargado.

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
| 6 | `CAP-CAT-SUP-01-LIST` | `docs/user-manual/images/proveedores/01-listado.png` | `CU-CAT-06`, `CU-REP-12` |
| 7 | `CAP-CAT-SUP-02-CREATE` | `docs/user-manual/images/proveedores/02-formulario-alta.png` | `CU-CAT-07` |
| 8 | `CAP-CAT-SUP-03-EDIT` | `docs/user-manual/images/proveedores/03-formulario-edicion-y-estado.png` | `CU-CAT-08`, `CU-CAT-09` |
| 9 | `CAP-CAT-CLI-01-LIST` | `docs/user-manual/images/clientes/01-listado.png` | `CU-CAT-10`, `CU-REP-13` |
| 10 | `CAP-CAT-CLI-02-CREATE` | `docs/user-manual/images/clientes/02-formulario-alta.png` | `CU-CAT-11` |
| 11 | `CAP-CAT-CLI-03-EDIT` | `docs/user-manual/images/clientes/03-formulario-edicion.png` | `CU-CAT-12` |
| 12 | `CAP-CAT-WAS-01-LIST` | `docs/user-manual/images/mermas/01-listado-inventario.png` | `CU-CAT-13`, `CU-REP-06`, `CU-REP-09` |
| 13 | `CAP-CAT-WAS-02-CREATE` | `docs/user-manual/images/mermas/02-formulario-registro.png` | `CU-CAT-14` |
| 14 | `CAP-CAT-WAS-03-EDIT` | `docs/user-manual/images/mermas/03-formulario-edicion.png` | `CU-CAT-15` |
| 15 | `CAP-CAT-WAS-04-STOCK` | `docs/user-manual/images/mermas/04-ajuste-existencia.png` | `CU-CAT-16` |
| 16 | `CAP-REP-WAS-05-EXPORT` | `docs/user-manual/images/mermas/05-exportar-reporte.png` | `CU-REP-09` |
| 17 | `CAP-ENT-01-LIST` | `docs/user-manual/images/compras/01-listado.png` | `CU-ENT-01` |
| 18 | `CAP-ENT-02-CREATE` | `docs/user-manual/images/compras/02-formulario-registro.png` | `CU-ENT-02` |
| 19 | `CAP-ENT-03-EDIT` | `docs/user-manual/images/compras/03-edicion-compra.png` | `CU-ENT-03`, `CU-ENT-05` |
| 20 | `CAP-ENT-04-CORRECT` | `docs/user-manual/images/compras/04-correccion-detalle.png` | `CU-ENT-04` |
| 21 | `CAP-REP-ENT-05-EXPORT` | `docs/user-manual/images/compras/05-exportar-reporte.png` | `CU-REP-11` |
| 22 | `CAP-SAL-MAT-01-LIST` | `docs/user-manual/images/salidas-material/01-listado.png` | `CU-CAT-20`, `CU-SAL-01` |
| 23 | `CAP-SAL-MAT-02-CREATE` | `docs/user-manual/images/salidas-material/02-formulario-registro.png` | `CU-SAL-02` |
| 24 | `CAP-SAL-MAT-03-EDIT` | `docs/user-manual/images/salidas-material/03-edicion-encabezado.png` | `CU-SAL-03`, `CU-SAL-04` |
| 25 | `CAP-SAL-MAT-04-SUPPLY` | `docs/user-manual/images/salidas-material/04-surtir-detalles.png` | `CU-SAL-05` |
| 26 | `CAP-SAL-MAT-05-RETURN` | `docs/user-manual/images/salidas-material/05-devolver-detalle.png` | `CU-SAL-06` |
| 27 | `CAP-REP-SAL-MAT-06-EXPORT` | `docs/user-manual/images/salidas-material/06-exportar-reporte.png` | `CU-REP-04` |
| 28 | `CAP-SAL-WAS-01-LIST` | `docs/user-manual/images/salidas-merma/01-listado.png` | `CU-SAL-07`, `CU-REP-08` |
| 29 | `CAP-SAL-WAS-02-CREATE` | `docs/user-manual/images/salidas-merma/02-formulario-registro.png` | `CU-SAL-08` |
| 30 | `CAP-SAL-WAS-03-EDIT` | `docs/user-manual/images/salidas-merma/03-edicion-encabezado.png` | `CU-SAL-09`, `CU-SAL-10` |
| 31 | `CAP-SAL-WAS-04-SUPPLY` | `docs/user-manual/images/salidas-merma/04-surtir-detalles.png` | `CU-SAL-11` |
| 32 | `CAP-SAL-WAS-05-RETURN` | `docs/user-manual/images/salidas-merma/05-devolver-detalle.png` | `CU-SAL-12` |
| 33 | `CAP-REP-SAL-WAS-06-EXPORT` | `docs/user-manual/images/salidas-merma/06-exportar-reporte.png` | `CU-REP-08` |
| 34 | `CAP-IDA-PER-01-LIST` | `docs/user-manual/images/personas/01-listado.png` | `CU-IDA-01`, `CU-REP-14` |
| 35 | `CAP-IDA-PER-02-CREATE` | `docs/user-manual/images/personas/02-formulario-alta.png` | `CU-IDA-02`, `CU-IDA-08`, `CU-IDA-09` |
| 36 | `CAP-IDA-PER-03-EDIT` | `docs/user-manual/images/personas/03-formulario-edicion.png` | `CU-IDA-03` |
| 37 | `CAP-IDA-USR-01-LIST` | `docs/user-manual/images/usuarios/01-listado.png` | `CU-IDA-04`, `CU-REP-15` |
| 38 | `CAP-IDA-USR-02-CREATE` | `docs/user-manual/images/usuarios/02-formulario-alta.png` | `CU-IDA-05` |
| 39 | `CAP-IDA-USR-03-EDIT` | `docs/user-manual/images/usuarios/03-formulario-edicion.png` | `CU-IDA-06` |
| 40 | `CAP-IDA-USR-04-PASSWORD` | `docs/user-manual/images/usuarios/04-cambio-contrasena.png` | `CU-IDA-07` |
| 41 | `CAP-REP-MOV-MAT-01-LIST` | `docs/user-manual/images/movimientos-material/01-historial-y-filtros.png` | `CU-REP-02` |
| 42 | `CAP-REP-MOV-MAT-02-EXPORT` | `docs/user-manual/images/movimientos-material/02-exportar-reporte.png` | `CU-REP-05` |
| 43 | `CAP-REP-MOV-WAS-01-LIST` | `docs/user-manual/images/movimientos-merma/01-historial-y-filtros.png` | `CU-REP-07` |
| 44 | `CAP-REP-MOV-WAS-02-EXPORT` | `docs/user-manual/images/movimientos-merma/02-exportar-reporte.png` | `CU-REP-10` |
| 45 | `CAP-ERR-404-NOT-FOUND` | `docs/user-manual/images/errores/01-pagina-no-encontrada.png` | Transversal |

## Cobertura adicional necesaria

Además de las pantallas nombradas directamente por el recorrido principal, el inventario incluye
estados necesarios para explicar decisiones y consecuencias del proceso:

- formularios de **edición**, porque muestran qué información permanece modificable después del
  alta;
- pantallas de **ajuste de existencia**, **surtido**, **devolución**, **corrección** y
  **cancelación**, porque estas acciones afectan inventario o el estado de un documento;
- filtros y diálogos de alcance de reporte, porque determinan qué información se descarga;
- la navegación autenticada, que muestra dónde cerrar sesión y cubre `CU-AUT-02` sin capturar ni
  publicar credenciales;
- los catálogos auxiliares de roles, departamentos, presentaciones, unidades, motivos y estados
  dentro de los formularios donde se consumen (`CU-IDA-08`, `CU-IDA-09` y `CU-CAT-17` a
  `CU-CAT-20`), ya que no tienen una vista web independiente.

Los reportes de inventario, proveedores, clientes, personas y usuarios descargan el archivo de
forma directa. Para esos casos, el listado es la evidencia visual correcta; el archivo generado
se valida por pruebas y no se trata como captura de interfaz. Los reportes mensuales de compras,
salidas y movimientos sí abren un diálogo y por eso tienen una imagen posterior específica.

## Datos de prueba requeridos

La automatización no crea ni modifica registros. El estado de prueba usado para las capturas debe
pertenecer a una cuenta ficticia con todos los permisos que se documentan y contener, como mínimo:

1. un material y una merma activos que admitan edición y ajuste;
2. una compra abierta con un detalle corregible y cancelable;
3. una salida aprobada y pendiente o parcial para mostrar el surtido de material, y otra completa
   con cantidad retornable para mostrar la devolución;
4. los estados equivalentes para una salida de merma;
5. al menos una persona, un usuario, un proveedor y un cliente editables;
6. movimientos de material y merma para que los historiales no aparezcan vacíos.

Si falta un permiso, un registro o un estado requerido, el selector de la acción no aparece y el
script falla en esa captura. Este comportamiento es intencional: evita publicar una secuencia
incompleta o incoherente. `DOCS_STORAGE_STATE` es obligatorio para las vistas protegidas; la
pantalla de inicio de sesión se toma en un contexto separado y sin autenticación.

## Revisión antes de publicar

Después de ejecutar `npm run docs:screenshots`, se debe comprobar que los datos sean ficticios,
que no aparezcan contraseñas, cookies ni datos personales, que los textos sean legibles y que el
estado visible coincida con los casos de uso asignados en la tabla. Sólo entonces las imágenes
revisadas se referencian desde el recorrido correspondiente del manual.
