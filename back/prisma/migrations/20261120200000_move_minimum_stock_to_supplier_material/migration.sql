BEGIN;

ALTER TABLE "SupplierMaterial"
    ADD COLUMN "minStock" DECIMAL(18,6) NOT NULL DEFAULT 0;

UPDATE "SupplierMaterial" AS offer
SET "minStock" = article."minStock"
FROM "Material" AS article
WHERE article.id = offer."materialId" AND article."minStock" <> 0;

ALTER TABLE "Material" DROP COLUMN "minStock";

COMMIT;
