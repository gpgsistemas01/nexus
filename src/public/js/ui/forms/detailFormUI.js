import { DOM_EVENT_NAMES } from '../../constants/events.js';
import { INPUT_SELECTORS, SELECT_SELECTORS } from '../../constants/selectors.js';
import { toggleContainerElements } from '../../utils/formUtils.js';
import { FORM_MODES } from '../../constants/formModes.js';
import { GOODS_RECEIPT_STATUS_LABELS } from '../../constants/goodsReceiptStatuses.js';
import { setMdbWrapperInputValue } from '../../plugins/mdb/baseInstance.js';

export const toggleDetailFormActions = ({ mode, status = 'Cerrada', showActions = true, withTotal = true, showAddMaterial = null }) => {
    const isView = mode === FORM_MODES.VIEW || mode === FORM_MODES.EDIT_DETAIL;
    const shouldShowAddMaterial = showAddMaterial ?? !isView;
    document.querySelector('.add-material-container')?.classList.toggle('d-none', !shouldShowAddMaterial);
    if (showAddMaterial !== null) toggleContainerElements({ selector: '.add-material-container', isDisabled: !shouldShowAddMaterial });
    document.querySelector('.total-container')?.classList.toggle('d-none', !withTotal);
    const approveContainer = document.querySelector('.approve-container');
    if (approveContainer) approveContainer.classList.toggle('d-none', !showActions || !(isView && status === GOODS_RECEIPT_STATUS_LABELS.OPEN));
};

export const clearAddedItemInput = ({ itemSelector, quantitySelector, presentationSelector, costSelector = null, clearItemOptions = false }) => {
    const itemInput = document.querySelector(itemSelector);
    if (clearItemOptions) itemInput.replaceChildren();
    itemInput.value = '';
    itemInput.dispatchEvent(new Event(DOM_EVENT_NAMES.CHANGE, { bubbles: true }));
    setMdbWrapperInputValue({ selector: quantitySelector, value: '' });
    setMdbWrapperInputValue({ selector: presentationSelector, value: '' });
    if (costSelector) setMdbWrapperInputValue({ selector: costSelector, value: '' });
};

export const clearAddedMaterialInput = () => clearAddedItemInput({
    itemSelector: SELECT_SELECTORS.MATERIAL,
    quantitySelector: INPUT_SELECTORS.QUANTITY,
    presentationSelector: INPUT_SELECTORS.PRESENTATION_DISPLAY,
    costSelector: INPUT_SELECTORS.COST_PER_UNIT,
    clearItemOptions: true
});
