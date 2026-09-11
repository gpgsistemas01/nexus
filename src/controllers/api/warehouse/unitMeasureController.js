import { findAllUnitMeasures } from "../../../services/warehouse/unitMeasureService.js";
import { createDataTableListController } from "../createDataTableListController.js";
import { createCatalogMutationControllers } from '../catalogAdministrationController.js';

export const getAllUnitMeasures = createDataTableListController({
    findAll: findAllUnitMeasures,
    columns: ['name']
});

export const { register: registerUnitMeasure, edit: editUnitMeasure, remove: removeUnitMeasure } =
    createCatalogMutationControllers({ catalog: 'unit-measures' });
