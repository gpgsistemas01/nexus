import { createDataTableListController } from '../createDataTableListController.js';
import { createCatalogMutationControllers } from '../catalogAdministrationController.js';
import { findAllStatuses } from '../../../services/admin/statusService.js';

export const getAllStatuses = createDataTableListController({
    findAll: findAllStatuses,
    columns: ['name']
});

export const { register: registerStatus, edit: editStatus, remove: removeStatus } =
    createCatalogMutationControllers({ catalog: 'statuses' });
