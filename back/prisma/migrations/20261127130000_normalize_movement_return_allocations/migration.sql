BEGIN;

CREATE TABLE "MovementReturnAllocation" (
    "returnMovementDetailId" UUID NOT NULL REFERENCES "MovementDetail"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "sourceMovementDetailId" UUID NOT NULL REFERENCES "MovementDetailCost"("movementDetailId") ON UPDATE CASCADE,
    "quantity" DECIMAL(18,6) NOT NULL CHECK ("quantity" > 0 AND "quantity" <> 'NaN'::numeric),
    PRIMARY KEY ("returnMovementDetailId", "sourceMovementDetailId"),
    CHECK ("returnMovementDetailId" <> "sourceMovementDetailId")
);
CREATE INDEX "MovementReturnAllocation_sourceMovementDetailId_idx"
    ON "MovementReturnAllocation"("sourceMovementDetailId");

CREATE TABLE "WasteMovementReturnAllocation" (
    "returnMovementDetailId" UUID NOT NULL REFERENCES "WasteMovementDetail"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "sourceMovementDetailId" UUID NOT NULL REFERENCES "WasteMovementDetailCost"("movementDetailId") ON UPDATE CASCADE,
    "quantity" DECIMAL(18,6) NOT NULL CHECK ("quantity" > 0 AND "quantity" <> 'NaN'::numeric),
    PRIMARY KEY ("returnMovementDetailId", "sourceMovementDetailId"),
    CHECK ("returnMovementDetailId" <> "sourceMovementDetailId")
);
CREATE INDEX "WasteMovementReturnAllocation_sourceMovementDetailId_idx"
    ON "WasteMovementReturnAllocation"("sourceMovementDetailId");

INSERT INTO "MovementReturnAllocation" ("returnMovementDetailId", "sourceMovementDetailId", "quantity")
SELECT cost."movementDetailId", source."movementDetailId", source."quantity"
FROM "MovementDetailCost" AS cost
CROSS JOIN LATERAL jsonb_to_recordset(cost."returnSources") AS source("movementDetailId" UUID, "quantity" DECIMAL(18,6));

INSERT INTO "WasteMovementReturnAllocation" ("returnMovementDetailId", "sourceMovementDetailId", "quantity")
SELECT cost."movementDetailId", source."movementDetailId", source."quantity"
FROM "WasteMovementDetailCost" AS cost
CROSS JOIN LATERAL jsonb_to_recordset(cost."returnSources") AS source("movementDetailId" UUID, "quantity" DECIMAL(18,6));

-- Confirma que consultar el costo desde el surtido conserva el valor y la cantidad de cada devolución.
DO $$
BEGIN
    IF EXISTS (
        WITH allocations AS (
            SELECT 'goods' AS ledger, link.*, returned."goodsIssueDetailId" AS return_issue_detail,
                supplied."goodsIssueDetailId" AS source_issue_detail, returned."quantity" AS return_quantity,
                supplied."quantity" AS source_quantity, return_movement."type" AS return_type,
                source_movement."type" AS source_type, return_cost."unitCost" AS return_cost, source_cost."unitCost" AS source_cost
            FROM "MovementReturnAllocation" AS link
            JOIN "MovementDetail" AS returned ON returned."id" = link."returnMovementDetailId"
            JOIN "MovementDetail" AS supplied ON supplied."id" = link."sourceMovementDetailId"
            JOIN "InventoryMovement" AS return_movement ON return_movement."id" = returned."movementId"
            JOIN "InventoryMovement" AS source_movement ON source_movement."id" = supplied."movementId"
            JOIN "MovementDetailCost" AS return_cost ON return_cost."movementDetailId" = returned."id"
            JOIN "MovementDetailCost" AS source_cost ON source_cost."movementDetailId" = supplied."id"
            UNION ALL
            SELECT 'waste', link.*, returned."wasteIssueDetailId", supplied."wasteIssueDetailId", returned."quantity",
                supplied."quantity", return_movement."type", source_movement."type", return_cost."unitCost", source_cost."unitCost"
            FROM "WasteMovementReturnAllocation" AS link
            JOIN "WasteMovementDetail" AS returned ON returned."id" = link."returnMovementDetailId"
            JOIN "WasteMovementDetail" AS supplied ON supplied."id" = link."sourceMovementDetailId"
            JOIN "WasteMovement" AS return_movement ON return_movement."id" = returned."movementId"
            JOIN "WasteMovement" AS source_movement ON source_movement."id" = supplied."movementId"
            JOIN "WasteMovementDetailCost" AS return_cost ON return_cost."movementDetailId" = returned."id"
            JOIN "WasteMovementDetailCost" AS source_cost ON source_cost."movementDetailId" = supplied."id"
        ), totals AS (
            SELECT allocations.*,
                SUM("quantity") OVER (PARTITION BY ledger, "returnMovementDetailId") AS allocated_to_return,
                SUM("quantity") OVER (PARTITION BY ledger, "sourceMovementDetailId") AS used_from_source
            FROM allocations
        )
        SELECT 1 FROM totals
        WHERE return_issue_detail IS NULL OR return_issue_detail IS DISTINCT FROM source_issue_detail
            OR return_type <> 'ENTRY' OR source_type <> 'ISSUE'
            OR return_cost <> source_cost OR allocated_to_return <> return_quantity OR used_from_source > -source_quantity
    ) THEN
        RAISE EXCEPTION 'Los orígenes históricos de devolución no coinciden con su costo o saldo';
    END IF;
END $$;

DELETE FROM "MovementDetailCost" WHERE jsonb_array_length("returnSources") > 0;
DELETE FROM "WasteMovementDetailCost" WHERE jsonb_array_length("returnSources") > 0;
ALTER TABLE "MovementDetailCost" DROP COLUMN "returnSources";
ALTER TABLE "WasteMovementDetailCost" DROP COLUMN "returnSources";

COMMIT;
