UPDATE "StockAdjustmentReason"
SET
    name = 'Devolución de compra',
    "updatedAt" = NOW()
WHERE name = 'Devolución';

INSERT INTO "StockAdjustmentReason"
(
    id,
    name,
    "isActive",
    "createdAt",
    "updatedAt"
)
VALUES
(
    gen_random_uuid(),
    'Devolución de salida',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (name) DO UPDATE
SET
    "isActive" = true,
    "updatedAt" = NOW();
