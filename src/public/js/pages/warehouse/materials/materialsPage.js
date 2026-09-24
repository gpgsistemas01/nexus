import { createMaterialDatatable } from "../../../plugins/datatable/warehouse/materials/materialDatatable.js";
import './materialForm.js';
import '../suppliers/supplierForm.js';

const context = window.meta || {};

createMaterialDatatable(context);
