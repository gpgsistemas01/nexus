import { previewHistoricalDeliveries, confirmHistoricalDeliveries } from '../../../services/warehouse/issues/historicalDeliveryService.js';
import { successCodeMessages } from '../../../shared/constants/apiSuccessCodes.js';

export const previewHistoricalDeliveryBatch = async (req, res) => {
    const preview = await previewHistoricalDeliveries({ user: req.user, resource: req.params.resource, query: req.query });
    res.set('Cache-Control', 'no-store');
    res.json({ preview });
};

export const confirmHistoricalDeliveryBatch = async (req, res) => {
    const result = await confirmHistoricalDeliveries({ user: req.user, resource: req.params.resource, command: req.body });
    res.set('Cache-Control', 'no-store');
    res.json({ code: successCodeMessages.HISTORICAL_DELIVERY_COMPLETED, ...result });
};
