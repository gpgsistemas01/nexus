import { useForm } from "../../application/form.js";
import { cancelGoodsReceipt, confirmGoodsReceipt, editGoodsReceipt, registerGoodsReceipt } from "../../application/warehouse/goodsReceipts.js";
import { validateGoodsReceiptValidators } from "../../utils/validations/validators.js";
import { refreshProductTable } from "../../plugins/datatable/baseDatatable.js";
import { createGoodsReceiptDatatable, details, initDetailsGoodsReceiptTable } from "../../plugins/datatable/goodsReceiptDatatable.js";
import { initGoodsReceiptFormSelect2, setGoodsReceiptFormSelectOptions } from "../../plugins/select2/goodsReceiptSelect.js";
import { toggleInputSelectErrors, toggleTableErrors, setFormReadOnly, toggleButtons } from "../../ui/formUI.js";
import { on } from "../../utils/domUtils.js";
import { formatDateLongWithTime } from "../../utils/formatters.js";
import { handleAction, handleSubmit, validateFields } from "../../utils/formUtils.js";
import { openModal } from "../../ui/modalUI.js";

const modalId = '#goodsReceiptModal';
const formId = '#goodsReceiptForm';

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

export const openGoodsReceiptModal = ({ mode, data = null }) => {

    const form = document.querySelector(formId);
    const modalElement = document.querySelector(modalId);

    form.dataset.mode = mode;
    form.dataset.id = data?.id || '';

    toggleButtons({ mode, status: data?.status?.name });
    setFormReadOnly({ form, isReadOnly: false });

    details.length = 0;

    initGoodsReceiptFormSelect2();

    if (mode === 'create') {
        
        form.reset();
        setGoodsReceiptFormSelectOptions();
        modalElement.querySelector('#modalTitle').textContent = 'Registrar compra';
        form.querySelector('#submitBtn').textContent = 'Guardar';
        form.querySelector('#presentationDisplayInput').value = '';
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

        setGoodsReceiptFormSelectOptions(data);

        if (mode === 'edit') {

            modalElement.querySelector('#modalTitle').textContent = 'Editar compra';
            form.querySelector('#submitBtn').textContent = 'Actualizar';
        }

        if (mode === 'view') {

            modalElement.querySelector('#modalTitle').textContent = 'Ver compra';

            setFormReadOnly({ form, isReadOnly: true });
        }
    }

    initDetailsGoodsReceiptTable(mode);

    openModal(modalElement);
}

const addProduct = () => {

    const productId = document.querySelector('#productInput').value;
    const selectedProduct = $('#productInput').select2('data')?.[0];
    const name = selectedProduct?.text || '';
    const quantity = Number(document.querySelector('#quantityInput').value);
    const unitCostByQuantity = Number(document.querySelector('#unitCostByQuantityInput').value);
    const base = Number(selectedProduct?.base);
    const height = Number(selectedProduct?.height);

    if (!productId || !quantity || !unitCostByQuantity) {
        alert('Por favor, complete los campos de producto, cantidad e importe.');
        return;
    }

    if (isNaN(quantity) || quantity < 1) {
        alert('La cantidad debe ser un número mayor a cero.');
        return;
    }

    if (isNaN(unitCostByQuantity) || unitCostByQuantity <= 0) {
        alert('El costo por Rollo s/ IVA debe ser un número positivo.');
        return;
    }

    const area = (base * height);
    const netPurchaseAmount = (quantity * unitCostByQuantity).toFixed(2);
    const grossPurchaseAmount = netPurchaseAmount * 1.16;
    const totalArea = (area * quantity).toFixed(2);
    const unitCostByArea = netPurchaseAmount / totalArea;
    const product = {
        productId,
        name,
        base,
        height,
        area,
        quantity,
        unitCostByQuantity,
        unitCostByArea,
        netPurchaseAmount,
        grossPurchaseAmount,
        totalArea,
    };
    details.push(product);

    refreshProductTable(details);
    cleanAddedProduct();

    const totalQuantityEl = document.querySelector('#totalQuantityDisplayInput');
    const totalNetPurchaseAmountEl = document.querySelector('#totalNetPurchaseAmountDisplayInput');
    const totalGrossPurchaseAmountEl = document.querySelector('#totalGrossPurchaseAmountDisplayInput');

    const totalQuantity = totalQuantityEl.value || 0;
    const totalNetPurchaseAmount = totalNetPurchaseAmountEl.value || 0;
    const totalGrossPurchaseAmount = totalGrossPurchaseAmountEl.value || 0;

    totalQuantityEl.value = Number(totalQuantity) + quantity;
    totalNetPurchaseAmountEl.value = (Number(totalNetPurchaseAmount) + Number(netPurchaseAmount)).toFixed(2);
    totalGrossPurchaseAmountEl.value = (Number(totalGrossPurchaseAmount) + Number(grossPurchaseAmount)).toFixed(2);
}

export const cleanAddedProduct = () => {

    $('#productInput').empty().trigger('change');
    document.querySelector('#quantityInput').value = '';
    document.querySelector('#netPurchaseAmountInput').value = '';
    document.querySelector('#presentationDisplayInput').value = '';
}

on('click', '#addProductBtn', addProduct);
on('click', '#cancelBtn', async () => await handleAction({ action: cancelGoodsReceipt, formId }));
on('click', '#confirmBtn', async () => await handleAction({ action: confirmGoodsReceipt, formId }));