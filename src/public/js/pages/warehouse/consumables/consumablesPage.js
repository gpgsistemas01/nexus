import { createConsumableDatatable } from '../../../plugins/datatable/warehouse/consumables/consumableDatatable.js';
import '../materials/materialForm.js';
import '../suppliers/supplierForm.js';

const context = window.meta || {};

createConsumableDatatable(context);
