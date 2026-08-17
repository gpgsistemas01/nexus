-- Rebuild derived square-meter values after increasing their storage scale.
-- Source dimensions were historically stored with two decimals, but their product can
-- now retain six decimals instead of the previously rounded result.

BEGIN;

-- Rebuild monetary detail values from the accepted CRUD operands. Keeping this in a
-- separate statement makes the recalculated net amount available to the unit-cost step.
UPDATE "GoodsReceiptDetail"
SET "netPurchaseAmount" = ROUND("quantity" * "costPerUnitType", 6),
    "grossPurchaseAmount" = ROUND(ROUND("quantity" * "costPerUnitType", 6) * 1.16, 6);

UPDATE "GoodsReceiptDetail" AS detail
SET "convertedQuantity" = CASE
        WHEN material."base" > 0 AND material."height" > 0
            THEN ROUND(detail."quantity" * material."base" * material."height", 6)
        ELSE detail."quantity"
    END,
    "conversionUnitCost" = CASE
        WHEN detail."quantity" > 0
             AND material."base" > 0
             AND material."height" > 0
            THEN ROUND(
                detail."netPurchaseAmount" /
                (detail."quantity" * material."base" * material."height"),
                6
            )
        WHEN detail."quantity" > 0
            THEN ROUND(detail."netPurchaseAmount" / detail."quantity", 6)
        ELSE 0
    END
FROM "Material" AS material
WHERE material."id" = detail."materialId";

-- Keep the correction audit consistent with the same cost formulas without changing
-- its captured operands or the historical material references.
UPDATE "GoodsReceiptDetailChange"
SET "previousNetPurchaseAmount" = ROUND("previousQuantity" * "previousCostPerUnitType", 6),
    "previousGrossPurchaseAmount" = ROUND(ROUND("previousQuantity" * "previousCostPerUnitType", 6) * 1.16, 6),
    "correctedNetPurchaseAmount" = ROUND("correctedQuantity" * "correctedCostPerUnitType", 6),
    "correctedGrossPurchaseAmount" = ROUND(ROUND("correctedQuantity" * "correctedCostPerUnitType", 6) * 1.16, 6),
    "quantityDifference" = ROUND("correctedQuantity" - "previousQuantity", 6),
    "costDifference" = ROUND("correctedCostPerUnitType" - "previousCostPerUnitType", 6);

-- Receipt headers are derived from active details. When every detail is canceled, the
-- existing CRUD keeps the historical total, so the fallback includes all details.
WITH receipt_totals AS (
    SELECT
        "goodsReceiptId",
        COALESCE(SUM("quantity") FILTER (WHERE "status" = 'ACTIVE'), SUM("quantity"), 0) AS quantity,
        COALESCE(SUM("netPurchaseAmount") FILTER (WHERE "status" = 'ACTIVE'), SUM("netPurchaseAmount"), 0) AS net,
        COALESCE(SUM("grossPurchaseAmount") FILTER (WHERE "status" = 'ACTIVE'), SUM("grossPurchaseAmount"), 0) AS gross
    FROM "GoodsReceiptDetail"
    GROUP BY "goodsReceiptId"
)
UPDATE "GoodsReceipt" AS receipt
SET "totalQuantity" = totals.quantity,
    "totalNetPurchaseAmount" = totals.net,
    "totalGrossPurchaseAmount" = totals.gross
FROM receipt_totals AS totals
WHERE totals."goodsReceiptId" = receipt."id";

-- Rebuild the supplier/material maximum after conversion unit costs have changed.
UPDATE "SupplierMaterial" AS stock
SET "maxUnitCost" = (
    SELECT MAX(detail."conversionUnitCost")
    FROM "GoodsReceiptDetail" AS detail
    INNER JOIN "GoodsReceipt" AS receipt ON receipt."id" = detail."goodsReceiptId"
    WHERE receipt."supplierId" = stock."supplierId"
      AND detail."materialId" = stock."materialId"
      AND detail."status" = 'ACTIVE'
)
WHERE EXISTS (
    SELECT 1
    FROM "GoodsReceiptDetail" AS detail
    INNER JOIN "GoodsReceipt" AS receipt ON receipt."id" = detail."goodsReceiptId"
    WHERE receipt."supplierId" = stock."supplierId"
      AND detail."materialId" = stock."materialId"
);

UPDATE "GoodsIssueDetail" AS detail
SET "convertedQuantity" = CASE
        WHEN material."base" > 0 AND material."height" > 0
            THEN ROUND(detail."quantity" * material."base" * material."height", 6)
        ELSE detail."quantity"
    END,
    "convertedQuantityDifference" = CASE
        WHEN detail."projectConvertedQuantity" IS NULL THEN NULL
        WHEN material."base" > 0 AND material."height" > 0
            THEN ROUND(
                detail."quantity" * material."base" * material."height" -
                detail."projectConvertedQuantity",
                6
            )
        ELSE ROUND(detail."quantity" - detail."projectConvertedQuantity", 6)
    END
FROM "Material" AS material
WHERE material."id" = detail."materialId";

UPDATE "SupplierMaterial" AS stock
SET "convertedQuantity" = CASE
    WHEN material."base" > 0 AND material."height" > 0
        THEN ROUND(stock."currentStock" * material."base" * material."height", 6)
    ELSE stock."currentStock"
END
FROM "Material" AS material
WHERE material."id" = stock."materialId";

UPDATE "Waste" AS waste
SET "convertedQuantity" = CASE
    WHEN waste."base" > 0 AND waste."height" > 0
        THEN ROUND(waste."currentStock" * waste."base" * waste."height", 6)
    ELSE waste."currentStock"
END;

UPDATE "WasteIssueDetail" AS detail
SET "convertedQuantity" = CASE
        WHEN waste."base" > 0 AND waste."height" > 0
            THEN ROUND(detail."quantity" * waste."base" * waste."height", 6)
        ELSE detail."quantity"
    END,
    "convertedQuantityDifference" = CASE
        WHEN detail."projectConvertedQuantity" IS NULL THEN NULL
        WHEN waste."base" > 0 AND waste."height" > 0
            THEN ROUND(
                detail."quantity" * waste."base" * waste."height" -
                detail."projectConvertedQuantity",
                6
            )
        ELSE ROUND(detail."quantity" - detail."projectConvertedQuantity", 6)
    END
FROM "Waste" AS waste
WHERE waste."id" = detail."wasteId";

COMMIT;
