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
    'Stock inicial',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (name) DO NOTHING;
