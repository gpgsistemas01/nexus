import { initWasteSelect2, setWasteSelectOptions } from "../../../plugins/select2/modules/wasteSelect.js";
import { setReasonVisualOption } from '../../../plugins/select2/domains/reason.js';
import { clearFormErrors, initForm, setFormDisabled, setFormSectionVisibility } from "../../../ui/formUI.js";
import { openModal } from "../../../ui/modalUI.js";
import { FORM_SELECTORS, MODAL_SELECTORS } from "../../../constants/selectors.js";
import { wasteDataFields, wasteSecondaryDataFields, wasteStockFields } from './wasteFields.js';

const wasteModalId = MODAL_SELECTORS.WASTE;
const formId = FORM_SELECTORS.WASTE_FORM;
const stockMode = 'edit-stock';
const createMode = 'create';
const initialStockReasonName = 'Stock inicial';
const stockDataSectionSelector = '.stock-data-section';

const isEditMode = (mode) => mode === 'edit';
const isStockMode = (mode) => mode === 'edit-stock';

const prepareWasteModal = ({
    mode,
    data
}) => {

    const form = document.querySelector(formId);
    const modalElement = document.querySelector(wasteModalId);
    const enableStockFields = mode === stockMode;
    const isCreateMode = mode === createMode;

    initForm({ 
        form, 
        mode, 
        id: isCreateMode ? '' : data?.id 
    });
    initWasteSelect2({ modalSelector: wasteModalId });
    setWasteSelectOptions({ modalSelector: wasteModalId, data });
    form.elements.base.value = isCreateMode ? '' : (data?.base ?? '');
    form.elements.height.value = isCreateMode ? '' : (data?.height ?? '');
    form.elements.currentStock.value = '';
    form.elements.observations.value = '';

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
        selector: `${ wasteModalId } ${ FORM_SELECTORS.REASON }`,
        name: !isStockMode(mode) ? initialStockReasonName : null,
        isDisabled: !isStockMode(mode)
    });
    clearFormErrors(form);

    return { form, modalElement };
};

export const openWasteModal = ({
    mode = 'create',
    data = null
} = {}) => {

    const { form, modalElement } = prepareWasteModal({
        mode,
        data
    });

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