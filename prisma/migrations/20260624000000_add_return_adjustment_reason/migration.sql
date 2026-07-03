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
    'Devolución',
    true,
    NOW(),
    NOW()
);
