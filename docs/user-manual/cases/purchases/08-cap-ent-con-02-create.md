<a id="CAP-ENT-CON-02-CREATE"></a>
# 8. CAP-ENT-CON-02-CREATE — Registrar compra de consumibles

**Caso de uso:** `CU-ENT-08` — Crear compra de consumible.

**Antes de empezar:** Tenga el comprobante y las cantidades y costos recibidos. Identifique el consumible y su proveedor en el catálogo.

1. Desde **Compras → Consumibles**, seleccione **Nueva compra**.
   ![CAP-ENT-CON-02-CREATE: formulario de compra de consumibles](../../images/purchases/08-consumables-form-registration.png)
2. Indique si el comprobante es factura o remisión y complete proveedor, persona que recibe, fecha y observaciones según lo recibido.
3. Use **Buscar consumible...** para elegir el artículo del proveedor correcto, o use **Nuevo consumible** para darlo de alta en este contexto.
4. Capture cantidad y costo por presentación, seleccione **Agregar** y revise los totales.
5. Seleccione **Guardar**. Nexus registra la compra, incrementa existencias y genera el movimiento como una sola operación.

**Compruebe el resultado:** Localice el folio en el listado y revise cantidades y total. En **Almacén → Consumibles**, la existencia aumenta por las cantidades registradas.
