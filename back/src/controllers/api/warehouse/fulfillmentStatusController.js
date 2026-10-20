import { findAllFulfillmentStatuses } from "../../../services/warehouse/fulfillmentStatusService.js";
import { createDataTableListController } from "../createDataTableListController.js";

export const getAllFulfillmentStatuses = createDataTableListController({
    findAll: findAllFulfillmentStatuses,
    columns: ['name']
});
