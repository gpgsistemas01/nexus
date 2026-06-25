INSERT INTO "StockAdjustmentReason" ("name", "isActive", "createdAt", "updatedAt")
VALUES ('Devolución', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO UPDATE SET
    "isActive" = EXCLUDED."isActive",
    "updatedAt" = CURRENT_TIMESTAMP;
