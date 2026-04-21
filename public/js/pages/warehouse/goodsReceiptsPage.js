import { useForm } from "../../application/form.js";
import { cancelGoodsReceipt, confirmGoodsReceipt, editGoodsReceipt, registerGoodsReceipt } from "../../application/warehouse/goodsReceipts.js";
import { validateGoodsReceiptValidators } from "../../utils/validations/validators.js";
import { refreshProductTable } from "../../plugins/datatable/baseDatatable.js";
import { createGoodsReceiptDatatable, details, initDetailsGoodsReceiptTable } from "../../plugins/datatable/goodsReceiptDatatable.js";
import { initGoodsReceiptSelect2 } from "../../plugins/select2/goodsReceiptSelect.js";
import { toggleInputSelectErrors, toggleTableErrors, setFormReadOnly, toggleButtons } from "../../ui/formUI.js";
import { on } from "../../utils/domUtils.js";
import { formatDateLongWithTime } from "../../utils/formatters.js";
import { handleAction, handleSubmit, validateFields } from "../../utils/formUtils.js";
import { backModal, openModal } from "../../ui/modalUI.js";

const modalId = '#goodsReceiptModal';
const formId = '#goodsReceiptForm';
const backSelector = `#backBtn-${modalId.replace('#', '')}`;

createGoodsReceiptDatatable();

useForm({
    selector: formId,
    normalizeData: ({ formData }) => {

        formData.details = details;
    },
    getErrors: (formData) => {
        
        let errors = {};

        errors = validateFields(validateGoodsReceiptValidators, formData);

        return errors;
    },
    normalizeErrors: ({ form, errors }) => {

        toggleTableErrors(form, errors);
        toggleInputSelectErrors(form, errors);
    },
    sendRequest: async ({ formData, form }) => {

        await handleSubmit({
            form,
            formData,
            create: registerGoodsReceipt,
            update: editGoodsReceipt
        });
    },
    normalizeServerErrors: (form, serverErrors) => {
        
        toggleTableErrors(form, serverErrors);
        toggleInputSelectErrors(form, serverErrors);
    }
});

export const openGoodsReceiptModal = async ({ mode, data = null }) => {

    const form = document.querySelector(formId);
    const modalElement = document.querySelector(modalId);

    form.dataset.mode = mode;
    form.dataset.id = data?.id || '';

    toggleButtons({ mode, status: data?.status?.name });
    setFormReadOnly({ form, isReadOnly: false });

    details.length = 0;

    if (mode === 'create') {
        
        form.reset();
        modalElement.querySelector('#modalTitle').textContent = 'Registrar recepción';
        form.querySelector('#submitBtn').textContent = 'Guardar';
        form.querySelector('#presentationDisplayInput').value = '';

        await initGoodsReceiptSelect2();
    }

    if (mode === 'edit' || mode === 'view') {

        form.querySelector('#observationsInput').value = data.observations || '';
        form.querySelector('#receptionDateInput').value = formatDateLongWithTime(data.receptionDate);
        details.push(...data?.details.map(detail => ({
            id: detail.id,
            name: detail.product.name,
            productId: detail.product.id,
            quantity: detail.quantity,
            unitCost: detail.unitCost,
            amount: detail.amount,
            base: detail.product.base,
            height: detail.product.height,
            description: detail.description,
            presentation: detail.product.presentation
        })));

        await initGoodsReceiptSelect2(data);

        if (mode === 'edit') {

            modalElement.querySelector('#modalTitle').textContent = 'Editar recepción';
            form.querySelector('#submitBtn').textContent = 'Actualizar';
        }

        if (mode === 'view') {

            modalElement.querySelector('#modalTitle').textContent = 'Ver recepción';

            setFormReadOnly({ form, isReadOnly: true });
        }
    }

    initDetailsGoodsReceiptTable(mode);

    openModal(modalElement);
}

const addProduct = () => {

    const productId = document.querySelector('#productInput').value;
    const selectedProduct = $('#productInput').select2('data')?.[0];
    const productName = selectedProduct?.text || '';
    const quantity = document.querySelector('#quantityInput').value;
    const amount = document.querySelector('#amountInput').value;
    const base = Number(selectedProduct?.base);
    const height = Number(selectedProduct?.height);

    if (!productId || !quantity || !amount) {
        alert('Por favor, complete los campos de producto, cantidad e importe.');
        return;
    }

    if (isNaN(quantity) || parseFloat(quantity) < 1) {
        alert('La cantidad debe ser un número mayor a cero.');
        return;
    }

    if (isNaN(amount) || parseFloat(amount) <= 0) {
        alert('El importe debe ser un número mayor a cero.');
        return;
    }

    const amountValue = Number(amount);
    const quantityValue = Number(quantity);
    const measuredFactor = Number.isFinite(base) && base > 0 && Number.isFinite(height) && height > 0
        ? (base * height * quantityValue)
        : quantityValue;

    if (!Number.isFinite(measuredFactor) || measuredFactor <= 0) {
        alert('No se pudo calcular el costo unitario para este detalle.');
        return;
    }

    const unitCost = (amountValue / measuredFactor).toFixed(2);
    const product = {
        productId,
        name: productName,
        quantity,
        unitCost,
        amount,
        base: Number.isFinite(base) ? base : null,
        height: Number.isFinite(height) ? height : null,
        presentation: selectedProduct?.presentation || 'PIEZA'
    };
    details.push(product);

    refreshProductTable(details);
    cleanAddedProduct();
}

export const cleanAddedProduct = () => {

    $('#productInput').empty().trigger('change');
    document.querySelector('#quantityInput').value = '';
    document.querySelector('#amountInput').value = '';
    document.querySelector('#presentationDisplayInput').value = '';
}

on('click', '#addProductBtn', addProduct);
on('click', '#cancelBtn', async () => await handleAction({ action: cancelGoodsReceipt, formId }));
on('click', '#confirmBtn', async () => await handleAction({ action: confirmGoodsReceipt, formId }));
on('click', backSelector, () => backModal());
