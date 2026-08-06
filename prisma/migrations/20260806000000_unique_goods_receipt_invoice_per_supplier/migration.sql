-- Invoice numbers are identifiers assigned by each supplier. Normalize legacy
-- values to the same representation used by the application before enforcing
-- that a supplier cannot have the same invoice registered twice.
UPDATE "GoodsReceipt"
SET "invoice" = UPPER(BTRIM("invoice"))
WHERE "invoice" IS NOT NULL;

CREATE UNIQUE INDEX "GoodsReceipt_supplierId_invoice_key"
ON "GoodsReceipt"("supplierId", "invoice");
