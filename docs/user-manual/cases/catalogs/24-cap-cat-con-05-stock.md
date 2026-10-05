<a id="CAP-CAT-CON-05-STOCK"></a>
# 24. CAP-CAT-CON-05-STOCK — Ajustar existencia

**Casos de uso:** `CU-ALM-21` — Ajustar existencia de consumible.

**Actor:** Administrador del sistema con permiso de ajuste.

**Errores posibles:** [Validación de formularios](../../error-messages.md#errores-validacion),
[Catálogos e inventario](../../error-messages.md#errores-catalogos).

1. En la fila del consumible seleccione **Ajustar stock** y compruebe el formulario:

   ![CAP-CAT-CON-05-STOCK: ajuste de existencia](../../images/consumables/05-adjustment-stock.png)

2. Seleccione una razón y capture **Nueva cantidad** y **Observaciones**.
3. Confirme que **Nueva cantidad** sea el saldo total deseado, no una cantidad para sumar.
4. Seleccione **Ajustar** y compruebe el nuevo saldo en el listado antes de repetir la
   operación.

El ajuste conserva actor, motivo, saldos y movimiento. Si no tiene el permiso específico,
la acción no se presenta y el servidor rechaza una solicitud directa.
