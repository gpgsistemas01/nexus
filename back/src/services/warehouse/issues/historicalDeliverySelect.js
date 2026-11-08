export const HISTORICAL_DELIVERY_SELECT = {
    id: true, reason: true, cutoffDate: true, deliveredAt: true, createdAt: true,
    user: { select: { id: true, name: true } }
};
