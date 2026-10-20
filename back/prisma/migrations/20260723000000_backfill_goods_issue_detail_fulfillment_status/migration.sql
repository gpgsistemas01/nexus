INSERT INTO "FulfillmentStatus" ("id", "name")
SELECT gen_random_uuid(), 'Cancelado'
WHERE NOT EXISTS (SELECT 1 FROM "FulfillmentStatus" WHERE "name" = 'Cancelado');

UPDATE "GoodsIssueDetail"
SET "fulfillmentStatusId" = CASE
    WHEN "isSupplied" = true
        AND COALESCE("suppliedQuantity", 0) > 0
        AND COALESCE("returnedQuantity", 0) >= COALESCE("suppliedQuantity", 0)
        THEN (SELECT "id" FROM "FulfillmentStatus" WHERE "name" = 'Cancelado')
    WHEN "isSupplied" = true
        THEN (SELECT "id" FROM "FulfillmentStatus" WHERE "name" = 'Surtido')
    ELSE (SELECT "id" FROM "FulfillmentStatus" WHERE "name" = 'Pendiente')
END
WHERE "fulfillmentStatusId" IS NULL;
