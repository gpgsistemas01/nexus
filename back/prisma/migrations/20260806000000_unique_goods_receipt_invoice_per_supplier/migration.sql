-- Invoice numbers are identifiers assigned by each supplier. Normalize legacy
-- values to the same representation used by the application before enforcing
-- that a supplier cannot have the same invoice registered twice.
UPDATE "GoodsReceipt"
SET "invoice" = UPPER(BTRIM("invoice"))
WHERE "invoice" IS NOT NULL;

-- Normalization can expose legacy duplicates that differed only by whitespace
-- or letter case. Keep every receipt and make the conflicting invoices visible
-- for manual review instead of deleting operational history. The UUID suffix is
-- deterministic and LEFT keeps the result within invoice's VARCHAR(50) limit.
WITH ranked_receipts AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "supplierId", "invoice"
      ORDER BY "id"
    ) AS duplicate_number
  FROM "GoodsReceipt"
  WHERE "invoice" IS NOT NULL
)
UPDATE "GoodsReceipt" AS receipt
SET "invoice" = LEFT(receipt."invoice", 1)
  || ' [DUPLICADO:' || receipt."id"::TEXT || ']'
FROM ranked_receipts AS ranked
WHERE ranked."id" = receipt."id"
  AND ranked.duplicate_number > 1;

CREATE UNIQUE INDEX "GoodsReceipt_supplierId_invoice_key"
ON "GoodsReceipt"("supplierId", "invoice");
