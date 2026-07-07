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
    'Devolución de compra',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (name) DO UPDATE
SET
    "isActive" = true,
    "updatedAt" = NOW();
