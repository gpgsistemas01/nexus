import { openUserModal } from './userModal.js';
import { createUserDatatable } from '../../../plugins/datatable/admin/users/userDatatable.js';
import './userForm.js';

createUserDatatable({ onOpen: openUserModal });
