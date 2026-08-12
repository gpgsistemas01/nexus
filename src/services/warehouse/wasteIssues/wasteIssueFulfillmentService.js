import { FULFILLMENT_STATUS_NAMES } from '../../../constants/warehouseStatuses.js';
import { WasteIssueStateConflict } from '../../../errors/warehouse/wasteIssueError.js';
import { findFulfillmentStatusIdsByName } from '../fulfillmentStatusService.js';

export const findWasteIssueFulfillmentStatusIds = async tx => {
    const names = Object.values(FULFILLMENT_STATUS_NAMES);
    const ids = await findFulfillmentStatusIdsByName({ tx, names });

    if (names.some(name => !ids.has(name))) {
        throw new WasteIssueStateConflict('No se encontraron los estados de surtido requeridos.');
    }

    return ids;
};
