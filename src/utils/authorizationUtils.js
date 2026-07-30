import { DEPARTMENT_NAMES } from '../constants/departments.js';
import { ROLE_NAMES } from '../constants/roles.js';

export const hasSystemWideReadAccess = (user) => (user?.accesses || []).some(access => (
    access.role === ROLE_NAMES.DIRECTOR
    || access.department === DEPARTMENT_NAMES.MANAGEMENT
));
