-- Los índices únicos de las relaciones conservan el prefijo supplierId y sus FK.
DROP INDEX "SupplierMaterial_supplierId_idx";
DROP INDEX "Waste_supplierId_idx";
DROP INDEX "GoodsReceipt_supplierId_idx";

-- Los índices de fecha creados antes en el historial conservan el prefijo type.
DROP INDEX "GoodsIssue_type_idx";
DROP INDEX "GoodsReceipt_type_idx";

-- No hay listados por usuario/createdAt para estos recibos. Sus lecturas usan
-- la PK o (userId, operationId), cuyo índice único también cubre la FK de usuario.
-- Se conserva (status, expiresAt, id) para la limpieza de importaciones vencidas.
DROP INDEX "InventoryImport_userId_createdAt_idx";
DROP INDEX "HistoricalDeliveryBatch_userId_createdAt_idx";
