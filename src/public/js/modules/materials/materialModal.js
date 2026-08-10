import { openModal } from "../../ui/modalUI.js";
import { initMaterialFormSelect2, setMaterialFormSelectOptions } from "../../plugins/select2/modules/materialSelect.js";
import { setReasonVisualOption } from '../../plugins/select2/domains/reason.js';
import { clearFormErrors, initForm, setFormDisabled, setFormSectionVisibility } from "../../ui/formUI.js";
import { FORM_SELECTORS, MODAL_SELECTORS } from "../../constants/selectors.js";
import { UI_PERMISSIONS } from "../../constants/permissions.js";

const materialSecondaryDataFields = ['name', 'minStock', 'maxUnitCost', 'isActive'];
const materialDataFields = [...materialSecondaryDataFields, 'base', 'height', 'supplierId', 'presentationId', 'unitMeasureId'];
const stockFields = ['newStock', 'reasonId', 'observations'];
const createMode = 'create';
const initialStockReasonName = 'Stock inicial';
const stockDataSectionSelector = '.stock-data-section';

const isEditMode = (mode) => mode === 'edit';
const isStockMode = (mode) => mode === 'edit-stock';

const includeStockPermission = () => {
    const appContext = typeof window !== 'undefined' ? window.meta || {} : {};
    const permissions = appContext.permissions || [];

    return Array.isArray(permissions)
        ? permissions.includes(UI_PERMISSIONS.MATERIALS_ADJUST_STOCK)
        : false;
};

export const openMaterialModal = ({
    mode = createMode,
    data = null,
    onSave = null
}) => {

    const form = document.querySelector(FORM_SELECTORS.MATERIAL_FORM);
    const modalElement = document.querySelector(MODAL_SELECTORS.MATERIAL);
    const isCreateMode = mode === createMode;

    initForm({ 
        form, 
        mode, 
        id: data?.id 
    });
    initMaterialFormSelect2({ modalSelector: MODAL_SELECTORS.MATERIAL });
    setMaterialFormSelectOptions({ modalSelector: MODAL_SELECTORS.MATERIAL, data });

    form.elements.name.value = data?.name || '';
    form.elements.minStock.value = data?.minStock || '';
    form.elements.maxUnitCost.value = data?.maxUnitCost ?? '';
    form.elements.base.value = data?.base || '';
    form.elements.height.value = data?.height || '';
    form.elements.isActive.checked = data?.isActive ?? true;

    setFormDisabled({ 
        form, 
        isDisabled: false 
    });
    setFormSectionVisibility({
        form,
        selector: stockDataSectionSelector,
        isVisible: includeStockPermission() || isStockMode(mode)
    });
    setFormDisabled({ 
        form, 
        fields: materialDataFields, 
        isDisabled: !isCreateMode
    });
    setFormDisabled({
        form,
        fields: materialSecondaryDataFields,
        isDisabled: isStockMode(mode)
    });
    setReasonVisualOption({
        selector: `${ MODAL_SELECTORS.MATERIAL } ${ FORM_SELECTORS.REASON }`,
        name: !isStockMode(mode) ? initialStockReasonName : null,
        isDisabled: !isStockMode(mode)
    });

    modalElement.querySelector('#modalTitle').textContent = isEditMode(mode)
        ? 'Editar material'
        : isStockMode(mode)
            ? 'Ajustar stock de material'
            : 'Registrar material';
    form.querySelector('#submitBtn').textContent = isEditMode(mode)
        ? 'Actualizar'
        : isStockMode(mode)
            ? 'Ajustar'
            : 'Guardar';

    form.onSave = onSave;

    openModal(modalElement);
};
