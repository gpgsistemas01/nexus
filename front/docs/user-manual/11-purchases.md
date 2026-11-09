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

- **Editar compra:** cambie **Factura/Remisión**, el número de factura cuando corresponda, **Persona que recibe**, **Fecha y hora de recepción** u **Observaciones**; pulse **Actualizar**.
- **Agregar detalles:** prepare las nuevas partidas y confirme; compruebe la existencia recibida.
- **Corregir detalle:** capture **Cantidad correcta** y **Costo por presentación correcto** y confirme **Corregir detalle**.
- **Cancelar detalle:** compruebe la partida y confirme la reversión de su existencia.

| Operación | Campos habilitados | Datos de consulta o conservados |
| --- | --- | --- |
| Editar una compra no cancelada | Tipo de comprobante, factura cuando aplica, receptor, fecha/hora y observaciones; puede agregar nuevas partidas. | Proveedor, folio y partidas ya registradas. Los importes se calculan. |
| Corregir detalle activo | Cantidad correcta y Costo por presentación correcto. | Artículo, proveedor, presentación y medidas. La cantidad corregida no puede superar la vigente. |
| Cancelar detalle | Confirmación de la partida seleccionada, sin capturar otros datos. | Resto del encabezado y partidas; compruebe que la existencia permita la reversión. |
| Consultar compra cancelada | Ninguno. | Encabezado, partidas y totales históricos; no se agregan ni corrigen detalles. |

Las partidas nuevas se preparan con artículo, cantidad y costo por presentación.
Puede retirar una partida nueva antes de guardar. Las partidas ya registradas se
atienden con **Corregir detalle** o **Cancelar detalle**, no sobrescribiendo la fila.
Al elegir Remisión, no se captura número de factura. Los selectores requieren los
permisos de consulta correspondientes.

![Corrección de una partida registrada.](images/21-purchase-correction.png)

La corrección recalcula la compra con sus partidas activas. Cambiar sólo el costo
conserva la existencia; reducir la cantidad ajusta la diferencia. La cantidad
correcta no puede superar la registrada. Tras corregir o cancelar una partida,
la compra se muestra actualizada.

Si la compra ya se utilizó, su reversión puede rechazarse. Cancelar la confirmación
no modifica datos.
<!-- manual:end -->

## Consultar una compra

**Ver compra** muestra encabezado, partidas y totales. Use **Regresar** para cerrar.

| Situación | Qué muestra la compra |
| --- | --- |
| Confirmada | Tiene partidas activas. |
| Partidas activas y canceladas | Sólo las activas integran los totales. |
| Cancelada | Totales históricos. Sólo consulta. |

Las partidas canceladas se conservan sin botones de acción.

![Consulta de una compra registrada.](images/20-purchase-view.png)

![Compra de materiales cancelada con totales históricos.](images/20c-purchase-canceled.png)

![Compra de consumibles cancelada con totales históricos.](images/20d-purchase-canceled.png)

Los totales de una compra cancelada conservan el saldo que había inmediatamente
antes de cancelar su última partida, sin sumar de nuevo las partidas canceladas antes.
No representan existencia vigente
ni se suman en los reportes de compras activas.

<!-- manual:any warehouse:reports-read -->
## Exportar compras

Pulse **Exportar Excel**, seleccione el alcance y confirme **Descargar Excel**.
Consulte [Reportes](14-reports.md) para elegir periodo o filtros.
<!-- manual:end -->
