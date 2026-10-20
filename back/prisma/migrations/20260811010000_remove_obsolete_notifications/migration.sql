-- Material inventory refreshes now use an ephemeral Socket.IO event instead
-- of persisted notifications. Goods receipt notifications were also retired.
DELETE FROM "Notification"
WHERE "entityType" IN (
    'goods-receipt',
    'material-low-stock',
    'material-stock-restored'
);
