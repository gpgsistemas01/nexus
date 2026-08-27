import { getAllRolesRequest } from "../../../services/admin/roleService.js";
import { createApplicationList } from '../../createCrudApplication.js';

export const getAllRoles = createApplicationList(getAllRolesRequest);
