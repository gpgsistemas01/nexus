import { findAllPresentations } from "../../../services/warehouse/presentationService.js";
import { createDataTableListController } from "../createDataTableListController.js";

export const getAllPresentations = createDataTableListController({
    findAll: findAllPresentations,
    columns: ['name']
});
