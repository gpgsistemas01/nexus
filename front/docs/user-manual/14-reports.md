# 14. Reportes y descargas

## Identificar el alcance

El archivo incluye todos los resultados de la consulta. Aplique primero los filtros
con **Buscar**.

<!-- manual:any warehouse:reports-read -->
- En **Almacén**, use **Descargar Excel**; en **Compras** y **Salidas**, **Exportar Excel**.
<!-- manual:end -->
<!-- manual:all persons:page-view person:reports-read -->
- En **Personas**, use **Exportar Excel**.
<!-- manual:end -->
<!-- manual:all users:manage admin:reports-read -->
- En **Usuarios**, use **Exportar Excel**.
<!-- manual:end -->
<!-- manual:all clients:page-view client:reports-read -->
- En **Clientes**, use **Exportar Excel**.
<!-- manual:end -->
<!-- manual:all suppliers:page-view supplier:reports-read -->
- En **Proveedores**, use **Exportar Excel**.
<!-- manual:end -->
<!-- manual:all movements:read admin:reports-read -->
- En **Movimientos**, use **Exportar Excel**.
<!-- manual:end -->

## Descargar desde una tabla

1. Abra el módulo, capture los filtros y pulse **Buscar**.
2. Compruebe que la consulta representa lo que desea obtener.
3. Pulse **Descargar Excel** o **Exportar Excel**, según la página.
4. Espere la descarga y abra el archivo en una aplicación compatible con Excel.
5. Revise su contenido, periodo y artículos antes de distribuirlo.

<!-- manual:any warehouse:reports-read -->
En inventario, revise **Incluir en Excel**:

| Opción | Registros incluidos por disponibilidad |
| --- | --- |
| Activos o con stock | Registros activos y registros que todavía tienen existencias. |
| Activos | Registros activos. |
| Con stock | Registros con existencias. |

La selección sólo cambia el archivo. Materiales y Consumibles incluyen todos los
proveedores que coinciden con la búsqueda; Mermas también aplica el proveedor seleccionado.
<!-- manual:end -->

<!-- manual:all persons:page-view person:reports-read -->
En Personas, quite el filtro por rol para habilitar la descarga. Puede filtrar por área.
<!-- manual:end -->

<!-- manual:any warehouse:reports-read admin:reports-read -->
<!-- manual:any warehouse:reports-read movements:read -->
## Elegir periodo o filtros en un documento

1. En el listado, pulse **Exportar Excel**.
2. En **Exportar reporte**, revise **Alcance del reporte**.
3. Para la consulta de la tabla, seleccione **Filtros aplicados en la tabla**.
4. Para un periodo mensual, elija **Mes actual** o **Mes específico**. En el segundo
   caso capture **Mes del reporte** y compruebe año y mes.
5. Pulse **Descargar Excel** y espere el archivo.

![Selección del alcance y periodo de una exportación.](images/27-report.png)

El alcance mensual incluye el mes completo y omite los filtros de tabla.
**Mes actual** usa el horario de Ciudad de México.
<!-- manual:end -->
<!-- manual:end -->

## Resolver una descarga fallida

Compruebe la conexión y el mensaje del formulario antes de repetir la descarga.
Revise también la carpeta de destino y los bloqueos del navegador. Descargar otra
vez no modifica inventario. Comparta los archivos por el medio autorizado de su organización.
