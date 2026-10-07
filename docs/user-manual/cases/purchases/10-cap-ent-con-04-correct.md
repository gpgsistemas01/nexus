<a id="CAP-ENT-CON-04-CORRECT"></a>
# 10. CAP-ENT-CON-04-CORRECT — Corregir consumible de una compra

**Caso de uso:** `CU-ENT-10` — Corregir consumible de una compra.

**Antes de empezar:** Compare el renglón con el comprobante y confirme la cantidad o el costo correctos.

1. Abra la compra desde **Compras → Consumibles**.
2. En el detalle activo, abra la acción de corrección del renglón.
   ![CAP-ENT-CON-04-CORRECT: corrección de consumible](../../images/purchases/10-consumables-correction-detail.png)
3. Capture la cantidad o el costo correctos. La cantidad debe ser mayor que cero y no superar la registrada. Seleccione **Corregir detalle** y acepte la confirmación con **Corregir detalle**.
4. Revise los totales y el efecto de inventario actualizado.

Nexus conserva los valores anteriores, el motivo, el actor y el movimiento relacionado.

**Compruebe el resultado:** Revise los valores corregidos y el total. Reducir la cantidad ajusta existencias; cambiar sólo el costo no cambia la cantidad disponible.
