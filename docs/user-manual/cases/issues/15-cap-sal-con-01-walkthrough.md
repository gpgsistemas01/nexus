<a id="CAP-SAL-CON-01-WALKTHROUGH"></a>
# 15. CAP-SAL-CON-01-WALKTHROUGH — Recorrido de salidas de consumibles

**Casos de uso:** `CU-SAL-15` a `CU-SAL-21`. Este recorrido corresponde al Personal de almacén y al Administrador del sistema, que hereda estas operaciones.

**Errores posibles:** [Validación de formularios](../../error-messages.md#errores-validacion), [Salidas de consumibles](../../error-messages.md#errores-salidas-consumibles).

**Antes de empezar:** Tenga la solicitud, el cliente o proyecto y las cantidades que se entregarán. Consulte **Almacén → Consumibles** para identificar cada artículo, su proveedor, su unidad y su existencia. Realice el primer registro acompañado por quien le enseña la operación.

<a id="consultar"></a>
## Consultar una salida — CU-SAL-15

1. Abra **Salidas → Consumibles**. El listado corresponde a consumibles; los materiales tienen su propia opción en el menú.
2. Busque un folio conocido o aplique los filtros disponibles con **Buscar / filtrar**.
3. Abra el registro y revise cliente, proyecto, artículos y estado. Consultarlo no descuenta existencias. Una salida **Cancelada** permanece disponible en consulta, con los campos bloqueados.
4. Desde este listado, elija la creación, edición, surtido, devolución o exportación que necesite y que esté disponible para su cuenta y el estado del registro.

<a id="crear"></a>
## Registrar la solicitud — CU-SAL-16

1. Seleccione **Nueva salida** y complete cliente, asesor, área, solicitante, proyecto, fecha y observaciones según la solicitud.
2. Si el cliente no existe, use **Nuevo cliente** en el selector y siga [crear cliente](../catalogs/11-cap-cat-cli-02-create.md), correspondiente a `CU-CAT-06`. Después seleccione el cliente registrado y continúe la solicitud. Para el Personal de almacén, esta alta se realiza desde la operación; el listado independiente de clientes corresponde al administrador.
3. Use **Buscar consumible...** para seleccionar el artículo correcto. Revise el proveedor para distinguir artículos con nombres similares.
4. Capture una cantidad positiva y seleccione **Agregar**. Repita para los otros consumibles y revise los renglones antes de continuar; no mezcle materiales con consumibles.
5. Seleccione **Guardar**. Compruebe el folio en el listado y el estado **Pendiente**. La existencia todavía no disminuye: el descuento ocurre al surtir.

<a id="editar-encabezado"></a>
## Editar el encabezado — CU-SAL-17

1. Localice la salida y abra **Editar registro**. La salida debe admitir edición y no estar cancelada.
2. Corrija únicamente los datos del encabezado habilitados, como participantes, proyecto, fecha u observaciones. Si ya hubo surtimiento, los detalles quedan en consulta.
3. Seleccione **Actualizar**, vuelva a consultar el folio y compruebe los datos corregidos. Editar el encabezado no cambia cantidades ni existencias.

<a id="editar-detalles"></a>
## Editar los detalles — CU-SAL-18

1. Abra **Editar registro** de una salida **Pendiente** en la que ningún detalle haya sido surtido.
2. Corrija la cantidad de un renglón existente o seleccione un consumible y su proveedor, capture una cantidad positiva y use **Agregar** para incorporarlo.
3. Revise la tabla completa y seleccione **Actualizar**. Compruebe los artículos y cantidades guardados; la existencia permanece igual.
4. Si la salida ya tiene algún detalle surtido, no intente modificar los detalles mediante la edición general. Consulte su estado y use sólo las operaciones disponibles.

<a id="surtir"></a>
## Surtir consumibles — CU-SAL-19

1. Confirme qué consumibles se entregarán físicamente y revise sus existencias.
2. Desde el listado, seleccione **Surtir detalle**. Marque **Surtir** en cada renglón pendiente que corresponda y complete **Cantidad de proyecto**.
3. Revise los renglones y seleccione **Surtir**. Cada casilla entrega toda la cantidad pendiente del renglón; **Cantidad de proyecto** es una referencia de consumo y no reemplaza esa cantidad. Debe existir saldo suficiente para entregar cada renglón seleccionado.
4. Compruebe los detalles surtidos, el estado de la salida y el descuento en **Almacén → Consumibles**. Si quedan otros renglones pendientes, la salida queda **Surtido parcial**; al completar todos, queda **Surtido**.

<a id="devolver"></a>
## Registrar un retorno — CU-SAL-20

Esta operación se realiza cuando la salida completa está **Surtida** y los artículos han regresado físicamente. No está habilitada mientras la salida permanezca **Surtido parcial**.

1. Abra la acción **Devolver material surtido** del listado de consumibles; ese es el nombre actual del control compartido. Seleccione **Devolver detalle de salida** en el renglón correspondiente.
2. Capture **Cantidad a devolver** y **Observaciones**. La cantidad debe ser mayor que cero y no superar lo surtido menos las devoluciones anteriores.
3. Seleccione **Devolver** y compruebe que la existencia del consumible aumentó por esa cantidad. Una devolución parcial conserva el detalle **Surtido**; devolver todo su saldo retornable lo deja **Cancelado**.
4. Si todos los renglones quedan cancelados, también se cancela la salida, que permanece disponible para consulta. No existe una cancelación independiente que sustituya el retorno físico.

<a id="exportar"></a>
## Obtener el reporte — CU-SAL-21

1. En **Salidas → Consumibles**, seleccione **Exportar Excel**.
2. Para conservar los filtros del listado, elija **Personalizado: usar filtros aplicados**. Para un reporte mensual, elija **Mes actual** u **Otro mes** y compruebe el periodo.
3. Revise el archivo descargado: debe corresponder al alcance elegido y contener salidas de consumibles. La exportación no modifica existencias.

**Compruebe el resultado:** Relacione siempre el folio, el estado y la existencia con lo que acaba de hacer. Si la conexión se interrumpe después de confirmar, vuelva a consultar el documento antes de repetir la operación.
