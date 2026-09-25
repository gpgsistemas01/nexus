<a id="CAP-CAT-WAS-05-ADD-STOCK"></a>
# 18. CAP-CAT-WAS-05-ADD-STOCK — Agregar existencia

**Caso de uso:** `CU-ALM-13` — Agregar existencia de merma.

**Controles que debe usar:** Acción **Agregar stock**; campo **Cantidad a agregar**; campo
**Observaciones** y botón **Agregar**. **Merma**, **Existencia actual** y **Existencia resultante**
son datos informativos.

1. En la fila de la merma, seleccione **Agregar stock**. La captura de referencia se genera por
   área con el identificador `CAP-CAT-WAS-06-ADD-STOCK`.
2. En el modal **Agregar stock de merma**, compruebe la merma seleccionada y su **Existencia actual**. Estos valores son informativos y no pueden modificarse desde esta operación.
3. Capture una **Cantidad a agregar** mayor que cero y compruebe **Existencia resultante** antes de
   confirmar. Si necesita dejar contexto para el historial, capture **Observaciones**; esta nota
   opcional se guarda en el documento individual de entrada, vinculado con su movimiento `ENTRY`.
4. Seleccione **Agregar** y compruebe que la existencia del listado coincide con la **Existencia
   resultante** mostrada en el modal.

Esta operación está disponible para Personal de almacén y para el Administrador del sistema. Nexus crea un documento individual con folio y lo vincula con el movimiento `ENTRY` del historial; no es un ajuste: no sustituye el saldo ni requiere un motivo de
ajuste. Sólo el Administrador del sistema puede usar **Ajustar stock**, cuyo valor sí reemplaza el
total existente.
