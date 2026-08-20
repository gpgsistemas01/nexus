import { toggleContainerElements } from '../../utils/formUtils.js';

export const toggleDetailFormActions = ({ mode, status = 'Cerrada', showActions = true, withTotal = true, showAddMaterial = null }) => {
    const isView = mode === 'view' || mode === 'edit-detail';
    const shouldShowAddMaterial = showAddMaterial ?? !isView;
    document.querySelector('.add-material-container')?.classList.toggle('d-none', !shouldShowAddMaterial);
    if (showAddMaterial !== null) toggleContainerElements({ selector: '.add-material-container', isDisabled: !shouldShowAddMaterial });
    document.querySelector('.total-container')?.classList.toggle('d-none', !withTotal);
    const approveContainer = document.querySelector('.approve-container');
    if (approveContainer) approveContainer.classList.toggle('d-none', !showActions || !(isView && status === 'Abierta'));
};

export const clearAddedItemInput = ({ itemSelector, quantitySelector, presentationSelector, costSelector = null, clearItemOptions = false }) => {
    const itemInput = document.querySelector(itemSelector);
    if (clearItemOptions) itemInput.replaceChildren();
    itemInput.value = '';
    itemInput.dispatchEvent(new Event('change', { bubbles: true }));
    document.querySelector(quantitySelector).value = '';
    document.querySelector(presentationSelector).value = '';
    const costInput = costSelector ? document.querySelector(costSelector) : null;
    if (costInput) costInput.value = '';
};

export const clearAddedMaterialInput = () => clearAddedItemInput({
    itemSelector: '#materialInput',
    quantitySelector: '#quantityInput',
    presentationSelector: '#presentationDisplayInput',
    costSelector: '#costPerUnitInput',
    clearItemOptions: true
});
