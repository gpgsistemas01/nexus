import { createWasteDatatable } from "../../../plugins/datatable/warehouse/wastes/wasteDatatable.js";
import './wasteForm.js';
import { openWasteModal } from './wasteModal.js';
import './wasteStockAdditionForm.js';
import { openWasteStockAdditionModal } from './wasteStockAdditionModal.js';

const context = window.meta || {};

createWasteDatatable({
    context,
    openWasteModal,
    openWasteStockAdditionModal
});
