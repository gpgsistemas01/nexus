import { hasPermission, UI_PERMISSIONS } from '../../../constants/permissions.js';
import { createPersonsDatatable } from '../../../plugins/datatable/admin/persons/personDatatable.js';
import './personForm.js';

createPersonsDatatable({
    canManagePersons: hasPermission(window.meta || {}, UI_PERMISSIONS.PERSONS_WRITE)
});
