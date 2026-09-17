# 10. Matriz de trazabilidad resumida

| Área | Código de referencia | Datos principales |
| --- | --- | --- |
| Acceso | `src/routes/api/authApiRoute.js`, `src/constants/permissions.js` | `User`, `Role`, `Department`, `UserRoleDepartment` |
| Personas | `src/routes/api/admin/personApiRoute.js` | `Person`, `PersonRoleDepartment` |
| Clientes | `src/routes/api/sales/clientApiRoute.js` | `Client`, `Person` |
| Materiales y proveedores | `src/routes/api/warehouse/materialApiRoute.js`, `supplierApiRoute.js` | `Material`, `Supplier`, `SupplierMaterial` |
| Recepciones | `src/routes/api/warehouse/goodsReceiptApiRoute.js` | `GoodsReceipt`, `GoodsReceiptDetail`, `GoodsReceiptDetailChange` |
| Salidas y devoluciones | `src/routes/api/warehouse/goodsIssueApiRoute.js` | `GoodsIssue`, `GoodsIssueDetail`, `GoodsIssueReturn` |
| Mermas y ajustes | `src/routes/api/warehouse/wasteApiRoute.js` | `Waste`, `WasteStockAdjustment`, `StockAdjustment` |
| Movimientos | `src/services/inventory/movementService.js` | `InventoryMovement`, `MovementDetail`, `WasteMovement` |
| Reportes | `src/routes/api/*/reportApiRoute.js` | Lecturas de los dominios anteriores |
