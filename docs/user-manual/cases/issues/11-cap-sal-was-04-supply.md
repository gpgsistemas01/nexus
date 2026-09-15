<a id="CAP-SAL-WAS-04-SUPPLY"></a>
# CAP-SAL-WAS-04-SUPPLY — Surtir detalles

**Casos de uso:** `CU-SAL-12` — Surtir merma.

**Errores posibles:** [Validación de formularios](../../error-messages.md#errores-validacion), [Salidas de merma](../../error-messages.md#errores-salidas-merma).

**Controles que debe usar:** Acción **Surtir detalle**; casilla de la columna **Surtir** y campo de la columna **Cantidad de proyecto** de cada renglón pendiente; botón **Surtir**.

1. En la fila de la salida, seleccione **Surtir detalle** para abrir sus renglones pendientes. Antes de continuar, compruebe que la pantalla mostrada coincida con la captura:

   ![CAP-SAL-WAS-04-SUPPLY: surtir detalles](../../images/salidas-merma/04-surtir-detalles.png)

2. En los renglones pendientes, marque la casilla **Surtir** y complete **Cantidad de proyecto**. El encabezado y los renglones ya surtidos permanecen deshabilitados como referencia.

   🟨 **ADVERTENCIA:** surtir descuenta existencias de merma. Confirme la merma y la cantidad de
   cada renglón seleccionado antes de continuar.

3. Revise la existencia y seleccione **Surtir**.

Después de confirmar, compruebe cuáles renglones quedaron surtidos y la existencia mostrada. Si el
resultado es incierto, actualice la salida antes de intentar surtir nuevamente.
