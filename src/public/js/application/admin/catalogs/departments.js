import { getAllDepartmentsRequest } from "../../../services/admin/departmentService.js";
import { createApplicationList } from '../../createCrudApplication.js';

export const getAllDepartments = createApplicationList(getAllDepartmentsRequest);
