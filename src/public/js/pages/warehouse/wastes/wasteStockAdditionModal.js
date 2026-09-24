import { FORM_MODES } from '../../../constants/formModes.js';
import { BUTTON_SELECTORS, FORM_SELECTORS, MODAL_SELECTORS } from '../../../constants/selectors.js';
import { initializeInventoryCrudModal } from '../../../ui/inventory/inventoryCrudModalUI.js';
import { openModal } from '../../../ui/modalUI.js';
import { buildInventorySelectText, getCurrentStock } from '../../../utils/warehouseInventoryUtils.js';
import { formatDecimal } from '../../../utils/formatUtils.js';

export const openWasteStockAdditionModal = ({ data }) => {
    const form = document.querySelector(FORM_SELECTORS.WASTE_STOCK_ADDITION);
    const modal = document.querySelector(MODAL_SELECTORS.WASTE_STOCK_ADDITION);

    initializeInventoryCrudModal({
        form,
        mode: FORM_MODES.ADD_STOCK,
        data
    });
    document.querySelector('#wasteStockAdditionName').textContent = buildInventorySelectText(data);
    document.querySelector('#wasteStockAdditionCurrentStock').textContent = formatDecimal(getCurrentStock(data));
    form.querySelector(BUTTON_SELECTORS.SUBMIT).textContent = 'Agregar';

    openModal(modal);
};
