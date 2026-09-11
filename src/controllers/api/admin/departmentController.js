import { findAllDepartments } from "../../../services/admin/departmentService.js";
import { createDataTableListController } from "../createDataTableListController.js";
import { createCatalogMutationControllers } from '../catalogAdministrationController.js';

export const getAllDepartments = createDataTableListController({
    findAll: findAllDepartments,
    columns: ['name']
});

export const { register: registerDepartment, edit: editDepartment, remove: removeDepartment } =
    createCatalogMutationControllers({ catalog: 'departments' });
