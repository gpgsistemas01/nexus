import { FULFILLMENT_STATUS_NAMES } from '../../../shared/constants/fulfillmentStatuses.js';
import { WasteIssueFulfillmentStatusNotFound } from '../../../errors/warehouse/wasteIssueError.js';
import { findFulfillmentStatusIdsByName } from '../fulfillmentStatusService.js';

export const findWasteIssueFulfillmentStatusIds = async tx => {
    const names = Object.values(FULFILLMENT_STATUS_NAMES);
    const ids = await findFulfillmentStatusIdsByName({ tx, names });

    if (names.some(name => !ids.has(name))) throw new WasteIssueFulfillmentStatusNotFound();

    return ids;
};
