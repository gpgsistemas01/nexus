<a id="CAP-SAL-WAS-05-RETURN"></a>
# 12. CAP-SAL-WAS-05-RETURN — Devolver detalle

**Casos de uso:** `CU-SAL-13` — Devolver merma surtida.

**Antes de empezar:** Vamos a registrar lo que regresó físicamente al almacén. Identifique la salida surtida, su detalle y la cantidad que todavía puede devolverse.

**Errores posibles:** [Validación de formularios](../../error-messages.md#errores-validacion), [Salidas de merma](../../error-messages.md#errores-salidas-merma).

**Controles que debe usar:** Acción **Devolver material surtido** de la fila y botón **Devolver detalle de salida**; campos **Cantidad a devolver** y **Observaciones**; botones **Devolver** y **Regresar**.

1. En la fila correspondiente, seleccione **Devolver material surtido** y después **Devolver detalle de salida**. Observe los controles que va a usar:

   ![CAP-SAL-WAS-05-RETURN: devolver detalle](../../images/areas/almacen/waste-issues/05-return-detail.png)

2. Complete **Cantidad a devolver** y **Observaciones**. El encabezado y los demás datos del detalle permanecen deshabilitados como referencia.
3. Seleccione **Devolver** para confirmar o **Regresar** para salir sin aplicar la devolución.

**Compruebe el resultado:** Consulte el detalle y la existencia; deben reflejar únicamente la cantidad que regresó.
