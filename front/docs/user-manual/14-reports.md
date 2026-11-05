# 14. Reportes y descargas

## Descargar Excel

1. Abra el módulo, aplique los filtros y compruebe la consulta.
2. Pulse **Exportar Excel**.
3. Revise el alcance y confirme **Descargar Excel**.
4. Abra el archivo `.xlsx` y compruebe su contenido.

Todos los módulos usan este recorrido. El nombre incluye mes y año de descarga.
Cerrar el diálogo sin confirmar no genera un archivo.

<!-- manual:any warehouse:reports-read -->
## Inventario

En **Incluir en Excel**, seleccione **Activos o con stock**, **Activos** o **Con stock**.
Se conservan la búsqueda y el orden. Materiales y Consumibles incluyen todos los
proveedores del tipo seleccionado; Mermas conserva también el filtro de proveedor.
<!-- manual:end -->

<!-- manual:any warehouse:reports-read admin:reports-read -->
<!-- manual:any warehouse:reports-read movements:read -->
## Compras, salidas y movimientos

En **Alcance del reporte**, elija:

| Opción | Contenido |
| --- | --- |
| Filtros aplicados en la tabla | Búsqueda, filtros y orden actuales, en todas las páginas. |
| Mes actual | Mes completo según el horario de Ciudad de México. |
| Mes específico | Mes completo del año y mes capturados. |

Los alcances mensuales omiten los filtros de la tabla.

![Selección del alcance y periodo de la exportación.](images/27-report.png)
<!-- manual:end -->
<!-- manual:end -->

<!-- manual:all persons:page-view person:reports-read -->
## Personas

En **Personas**, quite el filtro por rol para habilitar la descarga. Puede filtrar por área.
<!-- manual:end -->

## Si falla la descarga

Lea el aviso, revise la conexión y vuelva a pulsar **Descargar Excel**.
El diálogo conserva la selección. Descargar otra vez no modifica inventario.
