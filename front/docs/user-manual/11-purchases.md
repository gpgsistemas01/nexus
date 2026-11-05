# 11. Compras

Abra **Compras → Materiales** o **Consumibles**. Busque por folio, factura,
proveedor, persona o fecha y pulse **Buscar**.

![Listado de compras con filtros y acciones.](images/18-purchases-list.png)

<!-- manual:any goods:receipts-manage -->
## Registrar una compra

1. Pulse **Nueva compra** y seleccione proveedor y persona que recibe.
2. Elija **Factura** o **Remisión**, capture el número cuando corresponda y revise la fecha.
3. Seleccione el artículo, capture **Cantidad** y **Costo por Presentación** y pulse **Agregar**.
4. Repita para las demás partidas y revise cantidades e importes estimados.
5. Pulse **Guardar** y compruebe el folio y la existencia recibida.

![Compra preparada con encabezado, partidas e importes.](images/19-purchase-create.png)

Capture el costo por presentación; el servidor calcula los importes definitivos.
Las compras no actualizan el costo máximo del inventario: se configura en **Almacén**.

<!-- manual:any suppliers:manage materials:write -->
Si falta un proveedor o artículo, use **Registrar «nombre»** en el selector.
Guarde el alta auxiliar y continúe la compra con el registro seleccionado.
<!-- manual:end -->

## Editar o corregir

- **Editar compra:** cambie los campos habilitados del encabezado y pulse **Actualizar**.
- **Agregar detalles:** prepare las nuevas partidas y confirme; compruebe la existencia recibida.
- **Corregir detalle:** capture **Cantidad correcta** y **Costo por presentación correcto** y confirme **Corregir detalle**.
- **Cancelar detalle:** compruebe la partida y confirme la reversión de su existencia.

![Corrección de una partida registrada.](images/21-purchase-correction.png)

La corrección recalcula cantidades y totales de toda la compra con sus partidas
activas. Cambiar sólo el costo conserva la existencia; cambiar la cantidad ajusta su diferencia.

Una compra utilizada puede impedir la reversión. Revise el aviso antes de repetir.
Cancelar la confirmación no cambia el documento ni el inventario.
<!-- manual:end -->

## Consultar una compra

**Ver compra** muestra encabezado, partidas y totales. Use **Regresar** para cerrar.

| Situación | Qué muestra la compra |
| --- | --- |
| Confirmada | Tiene partidas activas. |
| Partidas activas y canceladas | Conserva ambas; los totales vigentes incluyen sólo las activas. |
| Cancelada | Todas las partidas están canceladas. Conserva sus totales históricos y es de consulta. |

![Consulta de una compra registrada.](images/20-purchase-view.png)

![Compra de materiales con partidas activas y canceladas.](images/20a-purchase-mixed.png)

![Compra de consumibles con partidas activas y canceladas.](images/20b-purchase-mixed.png)

![Compra de materiales cancelada con totales históricos.](images/20c-purchase-canceled.png)

![Compra de consumibles cancelada con totales históricos.](images/20d-purchase-canceled.png)

Los totales históricos de una compra cancelada no representan existencia vigente
ni se suman en los reportes de compras activas.

<!-- manual:any warehouse:reports-read -->
## Exportar compras

Pulse **Exportar Excel**, seleccione el alcance y confirme **Descargar Excel**.
Consulte [Reportes](14-reports.md) para elegir periodo o filtros.
<!-- manual:end -->
