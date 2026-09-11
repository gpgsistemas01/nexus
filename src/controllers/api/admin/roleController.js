import { findAllRoles } from "../../../services/admin/roleService.js";
import { createDataTableListController } from "../createDataTableListController.js";
import { createCatalogMutationControllers } from '../catalogAdministrationController.js';

export const getAllRoles = createDataTableListController({
    findAll: findAllRoles,
    columns: ['name']
});

export const { register: registerRole, edit: editRole, remove: removeRole } =
    createCatalogMutationControllers({ catalog: 'roles' });
