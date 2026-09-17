<a id="CAP-ENT-03-EDIT"></a>
# 3. CAP-ENT-03-EDIT — Edicion compra

**Casos de uso:** `CU-ENT-03` — Editar compra de material; `CU-ENT-05` — Cancelar material de una compra.

**Errores posibles:** [Validación de formularios](../../error-messages.md#errores-validacion), [Compras](../../error-messages.md#errores-compras).

**Controles que debe usar:** Acción **Editar registro**; opciones **Factura** y **Remisión**; campo **Número de Factura**; selectores **Buscar proveedor...** y **Buscar persona que recibe...**; campos **Fecha y hora de recepción:** y **Observaciones**; selector **Buscar material...**; campos **Cantidad** y **Costo por Presentación**; botones **Agregar**, **Actualizar** y **Regresar**.

1. En la fila de la compra, seleccione **Editar registro** para abrir el formulario. Antes de continuar, compruebe que la pantalla mostrada coincida con la captura:

   ![CAP-ENT-03-EDIT: edicion compra](../../images/compras/03-edicion-compra.png)

2. Modifique el comprobante, la persona que recibe, la fecha o las observaciones, y use **Agregar** para incorporar detalles nuevos. El proveedor y los renglones ya confirmados permanecen deshabilitados; para cambiar la cantidad o el costo de uno de esos renglones, use **Corregir detalle de compra**.
3. Seleccione **Actualizar** para guardar o **Regresar** para salir sin confirmar.
