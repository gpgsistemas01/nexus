import { findAllDepartments } from "../../../services/admin/departmentService.js";
import { createDataTableListController } from "../createDataTableListController.js";

export const getAllDepartments = createDataTableListController({
    findAll: findAllDepartments,
    columns: ['name']
});
