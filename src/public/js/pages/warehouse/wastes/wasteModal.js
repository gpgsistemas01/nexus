import { initWasteSelect2, setWasteSelectOptions } from "../../../plugins/select2/modules/wasteSelect.js";
import { setReasonVisualOption } from '../../../plugins/select2/domains/reason.js';
import { clearFormErrors, initForm, setFormDisabled, setFormSectionVisibility } from "../../../ui/formUI.js";
import { openModal } from "../../../ui/modalUI.js";
import { FORM_SELECTORS, MODAL_SELECTORS } from "../../../constants/selectors.js";
import { wasteDataFields, wasteStockFields } from './wasteFields.js';

const wasteModalId = MODAL_SELECTORS.WASTE;
const formId = FORM_SELECTORS.WASTE_FORM;
const stockMode = 'edit-stock';
const initialStockReasonName = 'Stock inicial';
const stockDataSectionSelector = '.stock-data-section';

const prepareWasteModal = ({
    mode,
    data,
    isStockAdjustment = false
}) => {

    const form = document.querySelector(formId);
    const modalElement = document.querySelector(wasteModalId);
    const enableStockFields = isStockAdjustment || mode === 'create';
    const isInitialStockCreation = mode === 'create' && !isStockAdjustment;
    const showStockDataSection = isStockAdjustment || mode === 'create';

    initForm({ form, mode, id: mode === 'create' ? '' : data?.id });
    initWasteSelect2({ modalSelector: wasteModalId });
    setWasteSelectOptions({ modalSelector: wasteModalId, data });
    form.elements.base.value = mode === 'create' ? '' : (data?.base ?? '');
    form.elements.height.value = mode === 'create' ? '' : (data?.height ?? '');
    form.elements.currentStock.value = '';
    form.elements.observations.value = '';

    setFormDisabled({ form, isDisabled: false });
    setFormSectionVisibility({
        form,
        selector: stockDataSectionSelector,
        isVisible: showStockDataSection
    });
    setFormDisabled({ form, fields: wasteDataFields, isDisabled: isStockAdjustment });
    setFormDisabled({ form, fields: wasteStockFields, isDisabled: !enableStockFields });
    setReasonVisualOption({
        selector: `${ wasteModalId } ${ FORM_SELECTORS.REASON }`,
        name: isInitialStockCreation ? initialStockReasonName : null,
        isDisabled: isInitialStockCreation
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
        data,
        isStockAdjustment: false
    });

    modalElement.querySelector('#modalTitle').textContent = mode === 'edit'
        ? 'Editar merma'
        : 'Registrar merma';
    form.querySelector('#submitBtn').textContent = mode === 'edit'
        ? 'Actualizar'
        : 'Guardar';

    openModal(modalElement);
};

export const openWasteStockAdjustmentModal = ({
    mode = stockMode,
    data = null
} = {}) => {

    const { form, modalElement } = prepareWasteModal({
        mode,
        data,
        isStockAdjustment: true
    });

    modalElement.querySelector('#modalTitle').textContent = 'Editar stock de merma';
    form.querySelector('#submitBtn').textContent = 'Actualizar';

    openModal(modalElement);
};
