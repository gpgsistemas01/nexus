-- Preserve the operational identity currently implied by SupplierMaterial
-- before allowing new wastes to be registered from independent snapshots.
ALTER TABLE "Waste"
ADD COLUMN "name" VARCHAR(200),
ADD COLUMN "supplierId" UUID,
ADD COLUMN "presentationId" UUID,
ADD COLUMN "unitMeasureId" UUID,
ADD COLUMN "maxUnitCost" DECIMAL(18,6);

UPDATE "Waste" AS waste
SET
  "name" = material."name",
  "supplierId" = supplier_material."supplierId",
  "presentationId" = material."presentationId",
  "unitMeasureId" = material."unitMeasureId",
  "maxUnitCost" = (
    SELECT MAX(candidate."maxUnitCost")
    FROM "SupplierMaterial" AS candidate
    WHERE candidate."materialId" = supplier_material."materialId"
  )
FROM "SupplierMaterial" AS supplier_material
JOIN "Material" AS material ON material."id" = supplier_material."materialId"
WHERE supplier_material."id" = waste."supplierMaterialId";

ALTER TABLE "Waste"
ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "supplierId" SET NOT NULL,
ALTER COLUMN "presentationId" SET NOT NULL,
ALTER COLUMN "unitMeasureId" SET NOT NULL;

DROP INDEX "Waste_supplierMaterialId_base_height_key";
DROP INDEX "Waste_supplierMaterialId_idx";

ALTER TABLE "Waste"
DROP CONSTRAINT "Waste_supplierMaterialId_fkey",
DROP COLUMN "supplierMaterialId";

CREATE UNIQUE INDEX "Waste_supplierId_name_base_height_key"
ON "Waste"("supplierId", "name", "base", "height");

CREATE INDEX "Waste_supplierId_idx" ON "Waste"("supplierId");
CREATE INDEX "Waste_presentationId_idx" ON "Waste"("presentationId");
CREATE INDEX "Waste_unitMeasureId_idx" ON "Waste"("unitMeasureId");

ALTER TABLE "Waste"
ADD CONSTRAINT "Waste_supplierId_fkey"
FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Waste"
ADD CONSTRAINT "Waste_presentationId_fkey"
FOREIGN KEY ("presentationId") REFERENCES "Presentation"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Waste"
ADD CONSTRAINT "Waste_unitMeasureId_fkey"
FOREIGN KEY ("unitMeasureId") REFERENCES "UnitMeasure"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- Enforce complete positive dimensions for every new or modified waste while
-- preserving legacy dimensionless rows until operations can measure them.
ALTER TABLE "Waste"
ADD CONSTRAINT "Waste_dimensions_required"
CHECK ("base" IS NOT NULL AND "base" > 0 AND "height" IS NOT NULL AND "height" > 0)
NOT VALID;
