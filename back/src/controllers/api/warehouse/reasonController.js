import { findAllReasons } from "../../../services/warehouse/reasonService.js";
import { createDataTableListController } from "../createDataTableListController.js";

export const getAllReasons = createDataTableListController({
    findAll: findAllReasons,
    columns: ['name']
});
