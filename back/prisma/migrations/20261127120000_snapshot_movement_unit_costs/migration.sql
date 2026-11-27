BEGIN;

CREATE INDEX "MovementDetail_goodsIssueDetailId_idx" ON "MovementDetail"("goodsIssueDetailId");

CREATE TABLE "MovementDetailCost" (
    "movementDetailId" UUID PRIMARY KEY REFERENCES "MovementDetail"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "unitCost" DECIMAL(18,6) NOT NULL CHECK ("unitCost" >= 0 AND "unitCost" <> 'NaN'::numeric),
    "returnSources" JSONB NOT NULL DEFAULT '[]',
    CHECK (jsonb_typeof("returnSources") = 'array')
);

CREATE TABLE "WasteMovementDetailCost" (
    "movementDetailId" UUID PRIMARY KEY REFERENCES "WasteMovementDetail"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "unitCost" DECIMAL(18,6) NOT NULL CHECK ("unitCost" >= 0 AND "unitCost" <> 'NaN'::numeric),
    "returnSources" JSONB NOT NULL DEFAULT '[]',
    CHECK (jsonb_typeof("returnSources") = 'array')
);

-- La partida conserva el costo exacto de la entrada si aún coincide con la
-- recepción original. Un costo editado después no se atribuye a esa entrada.
INSERT INTO "MovementDetailCost" ("movementDetailId", "unitCost")
SELECT movement_detail."id", receipt_detail."conversionUnitCost"
FROM "MovementDetail" AS movement_detail
JOIN "InventoryMovement" AS movement ON movement."id" = movement_detail."movementId"
JOIN "GoodsReceiptDetail" AS receipt_detail ON receipt_detail."id" = movement_detail."goodsReceiptDetailId"
JOIN "GoodsReceipt" AS receipt ON receipt."id" = receipt_detail."goodsReceiptId"
WHERE movement."type" = 'ENTRY'
    AND movement."goodsReceiptId" = receipt."id"
    AND movement_detail."supplierId" = receipt."supplierId"
    AND movement_detail."materialId" = receipt_detail."materialId"
    AND movement_detail."quantity" > 0
    AND movement_detail."quantity" = receipt_detail."quantity"
    AND receipt_detail."conversionUnitCost" > 0
    AND receipt_detail."conversionUnitCost" <> 'NaN'::numeric
    AND NOT EXISTS (
        SELECT 1 FROM "GoodsReceiptDetailChange" AS change
        WHERE change."goodsReceiptDetailId" = receipt_detail."id"
            AND change."changeType" <> 'CANCELLATION'
    );

COMMIT;
