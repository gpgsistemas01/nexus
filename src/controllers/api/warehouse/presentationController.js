import { findAllPresentations } from "../../../services/warehouse/presentationService.js";
import { createDataTableListController } from "../createDataTableListController.js";
import { createCatalogMutationControllers } from '../catalogAdministrationController.js';

export const getAllPresentations = createDataTableListController({
    findAll: findAllPresentations,
    columns: ['name']
});

export const { register: registerPresentation, edit: editPresentation, remove: removePresentation } =
    createCatalogMutationControllers({ catalog: 'presentations' });
