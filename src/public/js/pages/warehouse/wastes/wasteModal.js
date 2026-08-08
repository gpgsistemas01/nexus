import { initWasteSelect2, setWasteSelectOptions } from "../../../plugins/select2/modules/wasteSelect.js";
import { setReasonVisualOption } from '../../../plugins/select2/domains/reason.js';
import { clearFormErrors, initForm, setFormDisabled, setFormSectionVisibility } from "../../../ui/formUI.js";
import { openModal } from "../../../ui/modalUI.js";
import { FORM_SELECTORS, MODAL_SELECTORS } from "../../../constants/selectors.js";
import { wasteDataFields, wasteSecondaryDataFields, wasteStockFields } from './wasteFields.js';

const stockMode = 'edit-stock';
const createMode = 'create';
const initialStockReasonName = 'Stock inicial';
const stockDataSectionSelector = '.stock-data-section';

const isEditMode = (mode) => mode === 'edit';
const isStockMode = (mode) => mode === 'edit-stock';

export const openWasteModal = ({
    mode = 'create',
    data = null
} = {}) => {

    const form = document.querySelector(FORM_SELECTORS.WASTE_FORM);
    const modalElement = document.querySelector(MODAL_SELECTORS.WASTE);
    const isCreateMode = mode === createMode;

    initForm({ 
        form, 
        mode, 
        id: isCreateMode ? '' : data?.id 
    });
    initWasteSelect2({ modalSelector: MODAL_SELECTORS.WASTE });
    setWasteSelectOptions({ modalSelector: MODAL_SELECTORS.WASTE, data });

    form.elements.minStock.value = data?.minStock ?? '';
    form.elements.base.value = data?.base ?? '';
    form.elements.height.value = data?.height ?? '';
    form.elements.isActive.checked = data?.isActive ?? true;
    form.elements.observations.value = '';
    form.elements.currentStock.value = '';

    setFormDisabled({ 
        form, 
        isDisabled: false 
    });
    setFormSectionVisibility({
        form,
        selector: stockDataSectionSelector,
        isVisible: !isEditMode(mode)
    });
    setFormDisabled({ 
        form, 
        fields: wasteDataFields, 
        isDisabled: !isCreateMode
    });
    setFormDisabled({
        form,
        fields: wasteSecondaryDataFields,
        isDisabled: isStockMode(mode)
    });
    setFormDisabled({ 
        form, 
        fields: wasteStockFields, 
        isDisabled: isEditMode(mode)
    });
    setReasonVisualOption({
        selector: `${ MODAL_SELECTORS.WASTE } ${ FORM_SELECTORS.REASON }`,
        name: !isStockMode(mode) ? initialStockReasonName : null,
        isDisabled: !isStockMode(mode)
    });
    clearFormErrors(form);

    modalElement.querySelector('#modalTitle').textContent = isEditMode(mode)
        ? 'Editar merma'
        : isStockMode(mode)
            ? 'Ajustar stock de merma'
            : 'Registrar merma';
    form.querySelector('#submitBtn').textContent = isEditMode(mode)
        ? 'Actualizar'
        : isStockMode(mode)
            ? 'Ajustar'
            : 'Guardar';

    openModal(modalElement);
};