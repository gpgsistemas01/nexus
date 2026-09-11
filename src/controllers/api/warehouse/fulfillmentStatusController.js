import { findAllFulfillmentStatuses } from "../../../services/warehouse/fulfillmentStatusService.js";
import { createDataTableListController } from "../createDataTableListController.js";
import { createCatalogMutationControllers } from '../catalogAdministrationController.js';

export const getAllFulfillmentStatuses = createDataTableListController({
    findAll: findAllFulfillmentStatuses,
    columns: ['name']
});

export const { register: registerFulfillmentStatus, edit: editFulfillmentStatus, remove: removeFulfillmentStatus } =
    createCatalogMutationControllers({ catalog: 'fulfillment-statuses' });
