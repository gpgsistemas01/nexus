import { openClientModal } from './clientModal.js';
import { createClientDatatable } from "../../../plugins/datatable/sales/clients/clientDatatable.js";
import './clientForm.js';

createClientDatatable({ onOpen: openClientModal });
