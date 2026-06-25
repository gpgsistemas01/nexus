INSERT INTO "StockAdjustmentReason" ("name")
VALUES ('Devolución')
ON CONFLICT ("name") DO NOTHING;
