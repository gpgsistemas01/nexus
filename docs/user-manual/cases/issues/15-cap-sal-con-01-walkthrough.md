<a id="CAP-SAL-CON-01-WALKTHROUGH"></a>
# 15. CAP-SAL-CON-01-WALKTHROUGH — Recorrido de salidas de consumibles

**Casos de uso:** `CU-SAL-01` a `CU-SAL-07`, aplicados a consumibles.

**Antes de empezar:** Tenga la solicitud, el cliente o proyecto y las cantidades que se entregarán. Consulte **Almacén → Consumibles** para identificar cada artículo, su proveedor, su unidad y su existencia. Realice el primer registro acompañado por quien le enseña la operación.

## Localizar una salida

1. Abra **Salidas → Consumibles**. El listado corresponde a consumibles; los materiales tienen su propia opción en el menú.
2. Busque un folio conocido o aplique los filtros disponibles con **Buscar / filtrar**.
3. Abra el registro y revise cliente, proyecto, artículos y estado. Consultarlo no descuenta existencias.

## Registrar la solicitud

1. Seleccione **Nueva salida** y complete cliente, asesor, área, solicitante, proyecto, fecha y observaciones según la solicitud.
2. Use **Buscar consumible...** para seleccionar el artículo correcto. Revise el proveedor para distinguir artículos con nombres similares.
3. Capture la cantidad solicitada y seleccione **Agregar**. Repita para los otros consumibles y revise los renglones antes de continuar.
4. Seleccione **Guardar**. Compruebe el folio en el listado y el estado **Pendiente**. La existencia todavía no disminuye: el descuento ocurre al surtir.

## Editar y surtir

Antes del surtido, use **Editar registro** para corregir los datos habilitados o agregar renglones y después **Actualizar**. Una vez surtidos los detalles, éstos quedan de consulta y la edición se limita al encabezado.

1. Confirme qué consumibles se entregarán físicamente y revise sus existencias.
2. Desde el listado, seleccione **Surtir detalle**. Marque **Surtir** en cada renglón que corresponda y complete **Cantidad de proyecto**.
3. Revise los renglones y seleccione **Surtir**. La casilla entrega toda la cantidad pendiente del renglón; **Cantidad de proyecto** es una referencia de consumo y no reemplaza esa cantidad.
4. Compruebe los detalles surtidos, el estado de la salida y el descuento en **Almacén → Consumibles**. Si quedan renglones pendientes, la salida queda **Surtido parcial**; al completar todos, queda **Surtido**.

## Registrar un retorno

Esta operación se realiza cuando la salida está **Surtida** y los artículos han regresado físicamente.

1. Abra la acción **Devolver material surtido** del listado de consumibles; ese es el nombre actual del control compartido. Seleccione **Devolver detalle de salida** en el renglón correspondiente.
2. Capture **Cantidad a devolver** y **Observaciones**. La cantidad debe ser mayor que cero y no superar lo surtido que todavía no se haya devuelto.
3. Seleccione **Devolver** y compruebe que la existencia aumentó por esa cantidad. Una devolución total cancela el renglón; si todos quedan cancelados, también se cancela la salida, que permanece disponible para consulta.

## Obtener el reporte

En **Salidas → Consumibles**, seleccione **Exportar Excel**. Elija el mes o el período personalizado según la opción disponible y revise el archivo descargado: debe corresponder al período elegido y contener salidas de consumibles. La exportación no modifica existencias.

**Compruebe el resultado:** Relacione siempre el folio, el estado y la existencia con lo que acaba de hacer. Si la conexión se interrumpe después de confirmar, vuelva a consultar el documento antes de repetir la operación.
