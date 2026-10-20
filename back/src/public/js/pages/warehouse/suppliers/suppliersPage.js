import { openSupplierModal } from './supplierModal.js';
import { createSupplierDatatable } from "../../../plugins/datatable/warehouse/suppliers/supplierDatatable.js";
import './supplierForm.js';

createSupplierDatatable({ context: window.meta || {}, onOpen: openSupplierModal });
