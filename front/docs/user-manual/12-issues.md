# 12. Salidas

Abra **Salidas → Materiales**, **Consumibles** o **Mermas**. Aplique búsqueda,
fechas, área o cumplimiento y pulse **Buscar**. Su cuenta sólo muestra las áreas autorizadas.
Si dispone de una sola área, permanece seleccionada al limpiar filtros.

![Listado de salidas con búsqueda y cumplimiento.](images/22-issues-list.png)

<!-- manual:any goods:issues-manage waste:issues-manage -->
## Registrar una solicitud

1. Pulse **Nueva salida** y seleccione cliente, asesor, área y solicitante.
2. Capture proyecto, fecha y observaciones. Para **GPG INTERNO**, conserve el proyecto del área.
3. Seleccione material, consumible o merma, capture **Cantidad** y pulse **Agregar**.
4. Revise las partidas, pulse **Guardar** y compruebe el folio pendiente.

![Solicitud preparada con encabezado y partidas.](images/23-issue-create.png)

Repetir artículo y proveedor suma su cantidad; otro proveedor crea una partida distinta.
Materiales y consumibles requieren al menos una unidad; merma admite cantidades positivas menores.
Solicitar no descuenta inventario.

<!-- manual:any clients:create -->
Si falta un cliente, use **Registrar cliente «nombre»** en el selector y continúe después del alta.
<!-- manual:end -->

## Editar

Pulse **Editar salida**, cambie los campos habilitados y confirme **Actualizar**.
Los detalles se editan mientras no haya surtidos; después puede quedar habilitado sólo el encabezado.
<!-- manual:end -->

## Consultar y distinguir estados

**Consultar salida** muestra estado, cantidades surtidas y devueltas, pendiente
de surtir y saldo entregado de cada partida. **Regresar** cierra sin cambios.

| Cumplimiento | Qué significa |
| --- | --- |
| Pendiente | No hay entregas. |
| Surtido parcial | Se entregó una parte de un renglón o quedan renglones pendientes. |
| Surtido | Se completó la entrega. Una devolución parcial conserva este cumplimiento. |
| Cancelado | Todos los detalles se devolvieron por completo; sólo admite consulta. |

El estado se calcula al operar; abrir o cerrar una pantalla no lo cambia.
Las partidas canceladas se conservan sin botones de acción.

<!-- manual:any goods:issue-details-manage waste:issues-supply -->
## Surtir

1. Pulse **Surtir detalle** y marque las partidas que entregará.
2. Capture **Cantidad a surtir** sin superar el saldo pendiente.
3. Capture **Cantidad de proyecto**, que expresa el total del detalle para el proyecto.
4. Pulse **Surtir** y compruebe cantidades, cumplimiento y existencia descontada.

![Preparación de una entrega de inventario.](images/24-issue-supply.png)

El artículo debe tener costo máximo mayor que cero. Si falta, configúrelo en **Almacén**.
La cantidad de proyecto se expresa en la unidad de conversión y sirve para comparar
lo previsto con la cantidad convertida. El descuento de stock usa **Cantidad a surtir**.

## Devolver una entrega

1. En una salida **Surtida**, pulse **Devolver material surtido**.
2. Elija **Devolver detalle de salida** y compruebe el saldo retornable.
3. Capture cantidad y observaciones, confirme **Devolver** y revise el reintegro.

![Devolución de un detalle surtido.](images/25-issue-return.png)

Una devolución parcial conserva el detalle surtido. La devolución total lo cancela;
cuando todos se cancelan, se cancela la salida. No hay otra acción de cancelación.
Al confirmar, se cierra la devolución y vuelve a mostrarse la salida actualizada.
Puede devolver otro renglón con saldo; si la salida queda cancelada, sólo admite consulta.
No se devuelve mientras la salida siga en **Surtido parcial**.
<!-- manual:end -->

Materiales, Consumibles y Mermas comparten los estados de la tabla anterior.
Los ejemplos visuales siguientes se incluyen cuando existen documentos disponibles.

<!-- manual:any goods:issues-page-view -->
![Materiales con surtido parcial y saldo pendiente.](images/24a-issue-partial.png)

![Consumibles con surtido parcial y saldo pendiente.](images/24b-issue-partial.png)

![Materiales con devolución registrada y saldo entregado.](images/25a-issue-partial-return.png)

![Consumibles con devolución registrada y saldo entregado.](images/25b-issue-partial-return.png)

![Salida de materiales cancelada por devolución total.](images/25d-issue-canceled.png)

![Salida de consumibles cancelada por devolución total.](images/25e-issue-canceled.png)
<!-- manual:end -->

<!-- manual:any waste:issues-page-view -->
![Merma con surtido parcial y saldo pendiente.](images/24c-issue-partial.png)

![Merma con devolución registrada y saldo entregado.](images/25c-issue-partial-return.png)

![Salida de merma cancelada por devolución total.](images/25f-issue-canceled.png)
<!-- manual:end -->

<!-- manual:any warehouse:reports-read -->
## Exportar

Pulse **Exportar Excel**, elija alcance y confirme **Descargar Excel**.
Consulte [Reportes](14-reports.md).
<!-- manual:end -->
