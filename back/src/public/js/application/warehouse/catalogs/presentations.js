import { getAllPresentationsRequest } from "../../../services/warehouse/presentationService.js";
import { createApplicationList } from '../../createCrudApplication.js';

export const getAllPresentations = createApplicationList(getAllPresentationsRequest);
