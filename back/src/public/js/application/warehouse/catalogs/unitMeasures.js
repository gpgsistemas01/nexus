import { getAllUnitMeasuresRequest } from "../../../services/warehouse/unitMeasureService.js";
import { createApplicationList } from '../../createCrudApplication.js';

export const getAllUnitMeasures = createApplicationList(getAllUnitMeasuresRequest);
