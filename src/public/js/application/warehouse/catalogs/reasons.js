import { getAllReasonsRequest } from "../../../services/warehouse/reasonService.js";
import { createApplicationList } from '../../createCrudApplication.js';

export const getAllReasons = createApplicationList(getAllReasonsRequest);
