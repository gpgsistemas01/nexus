ALTER TABLE "WasteStockAdjustmentDetail"
ADD COLUMN "materialId" UUID,
ADD COLUMN "supplierId" UUID,
ADD COLUMN "materialName" VARCHAR(200),
ADD COLUMN "supplierName" VARCHAR(200),
ADD COLUMN "wasteBase" DECIMAL(10, 2),
ADD COLUMN "wasteHeight" DECIMAL(10, 2);

UPDATE "WasteStockAdjustmentDetail" AS detail
SET
  "materialId" = supplier_material."materialId",
  "supplierId" = supplier_material."supplierId",
  "materialName" = material."name",
  "supplierName" = supplier."tradeName",
  "wasteBase" = waste."base",
  "wasteHeight" = waste."height"
FROM "Waste" AS waste
JOIN "SupplierMaterial" AS supplier_material ON supplier_material."id" = waste."supplierMaterialId"
JOIN "Material" AS material ON material."id" = supplier_material."materialId"
JOIN "Supplier" AS supplier ON supplier."id" = supplier_material."supplierId"
WHERE detail."wasteId" = waste."id";

ALTER TABLE "WasteStockAdjustmentDetail"
ALTER COLUMN "materialId" SET NOT NULL,
ALTER COLUMN "supplierId" SET NOT NULL,
ALTER COLUMN "materialName" SET NOT NULL,
ALTER COLUMN "supplierName" SET NOT NULL;

CREATE INDEX "WasteStockAdjustmentDetail_materialId_idx" ON "WasteStockAdjustmentDetail"("materialId");
CREATE INDEX "WasteStockAdjustmentDetail_supplierId_idx" ON "WasteStockAdjustmentDetail"("supplierId");
