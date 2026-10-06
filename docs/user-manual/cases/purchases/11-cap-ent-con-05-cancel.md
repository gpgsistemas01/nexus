<a id="CAP-ENT-CON-05-CANCEL"></a>
# 11. CAP-ENT-CON-05-CANCEL — Cancelar consumible de una compra

**Caso de uso:** `CU-ENT-11` — Cancelar consumible de una compra.

1. Abra la compra desde **Compras → Consumibles**.
2. En el detalle activo, seleccione **Cancelar** y confirme la advertencia.
   ![CAP-ENT-CON-05-CANCEL: cancelación de consumible](../../images/purchases/11-consumables-cancel-detail.png)
3. Nexus marca el detalle como cancelado, revierte su existencia y conserva el historial.

Si era el último detalle activo, la compra completa pasa a estado cancelado y queda disponible sólo para consulta.
