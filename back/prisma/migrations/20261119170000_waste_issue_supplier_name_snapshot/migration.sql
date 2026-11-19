ALTER TABLE "WasteIssueDetail"
ADD COLUMN "supplierName" VARCHAR(200) NOT NULL DEFAULT '';

UPDATE "WasteIssueDetail" AS detail
SET "supplierName" = supplier."tradeName"
FROM "Waste" AS waste
JOIN "Supplier" AS supplier ON supplier."id" = waste."supplierId"
WHERE detail."wasteId" = waste."id";
