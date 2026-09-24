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
    const currentStock = Number(getCurrentStock(data));
    const quantityInput = document.querySelector('#wasteStockAdditionQuantityInput');
    const resultingStock = document.querySelector('#wasteStockAdditionResultingStock');
    const updateResultingStock = () => {
        const quantity = Number(quantityInput.value);
        resultingStock.textContent = formatDecimal(currentStock + (Number.isFinite(quantity) ? quantity : 0));
    };

    document.querySelector('#wasteStockAdditionCurrentStock').textContent = formatDecimal(currentStock);
    quantityInput.oninput = updateResultingStock;
    updateResultingStock();
    form.querySelector(BUTTON_SELECTORS.SUBMIT).textContent = 'Agregar';

    openModal(modal);
};
