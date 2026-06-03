import { openModal } from "../../ui/modalUI.js";
import { initProductFormSelect2, setProductFormSelectOptions } from "../../plugins/select2/modules/productSelect.js";
import { clearFormErrors, initForm, setFormReadOnly, toggleFormFields } from "../../ui/formUI.js";

const productModalId = '#productModal';
const formId = '#productForm';
const productFields = ['name', 'minStock', 'base', 'height', 'supplierId', 'presentationId', 'unitMeasureId', 'isActive'];
const stockFields = ['newStock', 'reasonId', 'observations'];

const shouldShowStockFields = ({ mode, includeStockAdjustmentOnCreate, isStockAdjustment }) =>
    isStockAdjustment || (mode === 'create' && includeStockAdjustmentOnCreate);

const setProductValues = ({ form, data = null }) => {

    form.elements.name.value = data?.name || '';
    form.elements.minStock.value = data?.minStock || '';
    form.elements.base.value = data?.base || '';
    form.elements.height.value = data?.height || '';

    if (form.elements.isActive) form.elements.isActive.checked = data?.isActive === undefined ? true : Boolean(data.isActive);
};

const prepareProductModal = ({
    mode,
    data,
    isStockAdjustment,
    includeStockAdjustmentOnCreate = false
}) => {

    const form = document.querySelector(formId);
    const modalElement = document.querySelector(productModalId);

    const showStockFields = shouldShowStockFields({
        mode,
        includeStockAdjustmentOnCreate,
        isStockAdjustment
    });

    initForm({ form, mode, id: data?.id });
    clearFormErrors(form);
    form.dataset.includeStockAdjustmentOnCreate = showStockFields && !isStockAdjustment ? 'true' : 'false';
    toggleFormFields({ form, fields: productFields, isVisible: true });
    toggleFormFields({ form, fields: stockFields, isVisible: showStockFields });
    setFormReadOnly({ form, fields: productFields, isReadOnly: isStockAdjustment });

    initProductFormSelect2({ modalSelector: productModalId, isStockAdjustment: showStockFields });
    setProductFormSelectOptions({ modalSelector: productModalId, data, isStockAdjustment: showStockFields });

    return { form, modalElement };
};

export const openProductModal = ({
    mode = 'create',
    data = null,
    onSave = null,
    includeStockAdjustmentOnCreate = false
}) => {

    const { form, modalElement } = prepareProductModal({
        mode,
        data,
        isStockAdjustment: false,
        includeStockAdjustmentOnCreate
    });

    setProductValues({ form, data: mode === 'edit' ? data : { name: data?.name, supplier: data?.supplier } });

    if (mode === 'create') {
        modalElement.querySelector('#modalTitle').textContent = 'Registrar producto';
        form.querySelector('#submitBtn').textContent = 'Guardar';
    }

    if (mode === 'edit') {
        modalElement.querySelector('#modalTitle').textContent = 'Editar producto';
        form.querySelector('#submitBtn').textContent = 'Actualizar';
    }

    form.onSave = onSave;

    openModal(modalElement);
};

export const openStockAdjustmentModal = ({
    mode = 'edit-stock',
    data = null,
    onSave = null
}) => {

    const { form, modalElement } = prepareProductModal({ mode, data, isStockAdjustment: true });

    setProductValues({ form, data });

    modalElement.querySelector('#modalTitle').textContent = 'Editar stock de producto';
    form.querySelector('#submitBtn').textContent = 'Actualizar';

    form.onSave = onSave;

    openModal(modalElement);
};
