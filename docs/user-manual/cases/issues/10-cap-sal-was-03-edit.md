<a id="CAP-SAL-WAS-03-EDIT"></a>
# CAP-SAL-WAS-03-EDIT — Edicion encabezado

**Casos de uso:** `CU-SAL-10` — Editar encabezado de salida de merma; `CU-SAL-11` — Editar detalles de merma de una salida.

**Errores posibles:** [Validación de formularios](../../error-messages.md#errores-validacion), [Salidas de merma](../../error-messages.md#errores-salidas-merma).

**Controles que debe usar:** Acción **Editar registro**; selectores **Buscar cliente...**, **Buscar asesor...**, **Buscar área...** y **Buscar solicitante...**; campos **Número de proyecto**, **Fecha y hora de solicitud** y **Observaciones**; cuando el estado lo permita, selector **Buscar merma...**, campo **Cantidad** y botón **Agregar**; botones **Actualizar** y **Regresar**.

1. En la fila de la salida, seleccione **Editar registro**. Antes de continuar, compruebe que la pantalla mostrada coincida con la captura:

   ![CAP-SAL-WAS-03-EDIT: edicion encabezado](../../images/salidas-merma/03-edicion-encabezado.png)

2. Modifique los selectores y campos indicados. Mientras la salida esté pendiente, también puede
   usar **Buscar merma...**, **Cantidad** y **Agregar** para incorporar detalles; después del primer
   surtido, los detalles quedan deshabilitados.
3. Seleccione **Actualizar** para guardar o **Regresar** para salir sin confirmar.
