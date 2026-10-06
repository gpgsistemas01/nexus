<a id="CAP-ENT-CON-02-CREATE"></a>
# 8. CAP-ENT-CON-02-CREATE — Registrar compra de consumibles

**Caso de uso:** `CU-ENT-08` — Crear compra de consumible.

1. Desde **Compras → Consumibles**, seleccione **Nueva compra**.
   ![CAP-ENT-CON-02-CREATE: formulario de compra de consumibles](../../images/purchases/08-consumables-form-registration.png)
2. Capture comprobante, proveedor, persona que recibe, fecha y observaciones.
3. Busque un consumible o use **Nuevo consumible** para darlo de alta en este contexto.
4. Capture cantidad y costo por presentación, seleccione **Agregar** y revise los totales.
5. Seleccione **Guardar**. Nexus registra la compra, incrementa existencias y genera el movimiento como una sola operación.

El selector no muestra materiales y el servidor rechaza cualquier detalle que no sea `CONSUMABLE`.
