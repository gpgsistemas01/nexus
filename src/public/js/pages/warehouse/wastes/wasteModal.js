import { initWasteSelect2, setWasteSelectOptions } from "../../../plugins/select2/modules/wasteSelect.js";
import { setReasonVisualOption } from '../../../plugins/select2/domains/reason.js';
import { clearFormErrors } from "../../../ui/forms/formErrorsUI.js";
import { initForm, setFormDisabled, setFormSectionVisibility } from "../../../ui/forms/formStateUI.js";
import { openModal } from "../../../ui/modalUI.js";
import { BUTTON_SELECTORS, FORM_SELECTORS, HEADING_SELECTORS, MODAL_SELECTORS, SELECT_SELECTORS } from "../../../constants/selectors.js";
import { wasteDataFields, wasteSecondaryDataFields, wasteStockFields } from './wasteFields.js';
import { FORM_MODES, isCreateMode, isEditMode, isStockMode } from '../../../constants/formModes.js';
import { displayWasteMaterialTemplate } from './wasteTemplateForm.js';

const initialStockReasonName = 'Stock inicial';
const stockDataSectionSelector = '.stock-data-section';

export const openWasteModal = ({
    mode = FORM_MODES.CREATE,
    data = null
} = {}) => {

    const form = document.querySelector(FORM_SELECTORS.WASTE);
    const modalElement = document.querySelector(MODAL_SELECTORS.WASTE);
    const isCreating = isCreateMode(mode);
    const isEditing = isEditMode(mode);
    const isAdjustingStock = isStockMode(mode);

    initForm({ 
        form, 
        mode, 
        id: isCreating ? '' : data?.id
    });
    initWasteSelect2({ modalSelector: MODAL_SELECTORS.WASTE });
    setWasteSelectOptions({ modalSelector: MODAL_SELECTORS.WASTE, data });

    form.elements.minStock.value = data?.minStock ?? '';
    form.elements.base.value = data?.base ?? '';
    form.elements.height.value = data?.height ?? '';
    displayWasteMaterialTemplate({ form, template: data });
    form.elements.isActive.checked = data?.isActive ?? true;
    form.elements.observations.value = '';
    form.elements.newStock.value = '';

    setFormDisabled({ 
        form, 
        isDisabled: false 
    });
    setFormSectionVisibility({
        form,
        selector: stockDataSectionSelector,
        isVisible: !isEditing
    });
    setFormDisabled({ 
        form, 
        fields: wasteDataFields, 
        isDisabled: !isCreating
    });
    setFormDisabled({
        form,
        fields: wasteSecondaryDataFields,
        isDisabled: isAdjustingStock
    });
    setFormDisabled({ 
        form, 
        fields: wasteStockFields, 
        isDisabled: isEditing
    });
    setReasonVisualOption({
        selector: `${ MODAL_SELECTORS.WASTE } ${ SELECT_SELECTORS.REASON }`,
        name: !isAdjustingStock ? initialStockReasonName : null,
        isDisabled: !isAdjustingStock
    });
    clearFormErrors(form);

    modalElement.querySelector(HEADING_SELECTORS.MODAL_TITLE).textContent = isEditing
        ? 'Editar merma'
        : isAdjustingStock
            ? 'Ajustar stock de merma'
            : 'Registrar merma';
    form.querySelector(BUTTON_SELECTORS.SUBMIT).textContent = isEditing
        ? 'Actualizar'
        : isAdjustingStock
            ? 'Ajustar'
            : 'Guardar';

    openModal(modalElement);
};
