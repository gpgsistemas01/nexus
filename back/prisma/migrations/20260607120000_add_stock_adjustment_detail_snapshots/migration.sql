-- AlterTable
ALTER TABLE "StockAdjustmentDetail"
ADD COLUMN "productName" VARCHAR(200) NOT NULL DEFAULT 'Producto sin nombre',
ADD COLUMN "supplierName" VARCHAR(200) NOT NULL DEFAULT 'Proveedor sin nombre';

UPDATE "StockAdjustmentDetail" sad
SET
    "productName" = COALESCE(p."name", sad."productName"),
    "supplierName" = COALESCE(s."tradeName", sad."supplierName")
FROM "Product" p, "Supplier" s
WHERE sad."productId" = p."id"
  AND sad."supplierId" = s."id";

ALTER TABLE "StockAdjustmentDetail"
ALTER COLUMN "productName" DROP DEFAULT,
ALTER COLUMN "supplierName" DROP DEFAULT;
