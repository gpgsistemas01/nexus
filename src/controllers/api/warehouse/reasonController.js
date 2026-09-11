import { findAllReasons } from "../../../services/warehouse/reasonService.js";
import { createDataTableListController } from "../createDataTableListController.js";
import { createCatalogMutationControllers } from '../catalogAdministrationController.js';

export const getAllReasons = createDataTableListController({
    findAll: findAllReasons,
    columns: ['name']
});

export const { register: registerReason, edit: editReason, remove: removeReason } =
    createCatalogMutationControllers({ catalog: 'reasons' });
