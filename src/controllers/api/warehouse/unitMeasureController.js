import { findAllUnitMeasures } from "../../../services/warehouse/unitMeasureService.js";
import { createDataTableListController } from "../createDataTableListController.js";

export const getAllUnitMeasures = createDataTableListController({
    findAll: findAllUnitMeasures,
    columns: ['name']
});
