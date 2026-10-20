ALTER TABLE "SupplierMaterial" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

UPDATE "SupplierMaterial" AS supplier_material
SET "isActive" = material."isActive"
FROM "Material" AS material
WHERE supplier_material."materialId" = material."id";

ALTER TABLE "Material" DROP COLUMN "isActive";
