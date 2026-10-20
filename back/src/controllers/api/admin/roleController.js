import { findAllRoles } from "../../../services/admin/roleService.js";
import { createDataTableListController } from "../createDataTableListController.js";

export const getAllRoles = createDataTableListController({
    findAll: findAllRoles,
    columns: ['name']
});
