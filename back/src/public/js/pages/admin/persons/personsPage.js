import { openPersonModal } from './personModal.js';
import { hasPermission, PERMISSIONS } from '../../../../../shared/constants/permissions.js';
import { createPersonsDatatable } from '../../../plugins/datatable/admin/persons/personDatatable.js';
import './personForm.js';

createPersonsDatatable({
    onOpen: openPersonModal,
    canManagePersons: hasPermission(window.meta || {}, PERMISSIONS.PERSONS_WRITE)
});
