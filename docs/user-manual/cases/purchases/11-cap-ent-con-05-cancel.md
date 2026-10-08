<a id="CAP-ENT-CON-05-CANCEL"></a>
# 11. CAP-ENT-CON-05-CANCEL — Cancelar consumible de una compra

**Caso de uso:** `CU-ENT-11` — Cancelar consumible de una compra.

**Antes de empezar:** Confirme que corresponde revertir ese renglón y revise cuánto se registró originalmente.

1. Abra la compra desde **Compras → Consumibles**.
2. En el detalle activo, abra la acción de cancelación del renglón y revise la advertencia antes de confirmar **Cancelar detalle**.
   ![CAP-ENT-CON-05-CANCEL: cancelación de consumible](../../images/purchases/11-consumables-cancel-detail.png)
3. Nexus marca el detalle como cancelado, revierte su existencia y conserva el historial.

Si era el último detalle activo, la compra completa pasa a estado cancelado y queda disponible sólo para consulta.

**Compruebe el resultado:** El renglón queda cancelado y se revierte la cantidad de esa compra. Si no quedan detalles activos, también se cancela el documento y permanece de consulta.
