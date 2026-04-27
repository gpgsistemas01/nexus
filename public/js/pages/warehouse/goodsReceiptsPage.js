import { useForm } from "../../application/form.js";
import { registerGoodsReceipt } from "../../application/warehouse/goodsReceipts.js";
import { validateGoodsReceiptValidators } from "../../utils/validations/validators.js";
import { refreshProductTable } from "../../plugins/datatable/baseDatatable.js";
import { createGoodsReceiptDatatable, details, initDetailsGoodsReceiptTable } from "../../plugins/datatable/goodsReceiptDatatable.js";
import { initGoodsReceiptFormSelect2, setGoodsReceiptFormSelectOptions } from "../../plugins/select2/modules/goodsReceiptSelect.js";
import { toggleInputSelectErrors, toggleTableErrors, setFormReadOnly } from "../../ui/formUI.js";
import { on } from "../../utils/domUtils.js";
import { formatDateLongWithTime } from "../../utils/formatters.js";
import { handleSubmit, validateFields } from "../../utils/formUtils.js";
import { openModal } from "../../ui/modalUI.js";
import { initMdbWrapperInput, updateMdbWrapperInput } from "../../plugins/mdb/baseInstance.js";

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
            create: registerGoodsReceipt
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

    setFormReadOnly({ form, isReadOnly: false });

    details.length = 0;

    initGoodsReceiptFormSelect2();

    if (mode === 'create') {
        
        form.reset();
        setGoodsReceiptFormSelectOptions();
        modalElement.querySelector('#modalTitle').textContent = 'Registrar compra';
        form.querySelector('#submitBtn').textContent = 'Confirmar';
        form.querySelector('#presentationDisplayInput').value = '';
    }

    if (mode === 'view') {

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

        modalElement.querySelector('#modalTitle').textContent = 'Ver compra';
        setFormReadOnly({ form, isReadOnly: true });
    }

    initDetailsGoodsReceiptTable(mode);

    openModal(modalElement);
}

const addProduct = () => {

    const supplierId = document.querySelector('#supplierInput').value;
    const productId = document.querySelector('#productInput').value;
    const selectedProduct = $('#productInput').select2('data')?.[0];
    const name = selectedProduct?.text || '';
    const quantity = Number(document.querySelector('#quantityInput').value);
    const unitCostByQuantity = Number(document.querySelector('#unitCostByQuantityInput').value);
    const base = Number(selectedProduct?.base);
    const height = Number(selectedProduct?.height);

    if (!supplierId) {
        alert('Selecciona un proveedor antes de agregar productos.');
        return;
    }

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

    const area = Number((base * height).toFixed(2));
    const netPurchaseAmount = Number((quantity * unitCostByQuantity).toFixed(2));
    const grossPurchaseAmount = Number((netPurchaseAmount * 1.16).toFixed(2));
    const totalArea = Number((area * quantity).toFixed(2));
    const unitCostByArea = Number((netPurchaseAmount / totalArea).toFixed(2));
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

    let totalQuantity = Number(totalQuantityEl.value) || 0;
    let totalNetPurchaseAmount = Number(totalNetPurchaseAmountEl.value) || 0;
    let totalGrossPurchaseAmount = Number(totalGrossPurchaseAmountEl.value) || 0;

    totalQuantity += quantity;
    totalNetPurchaseAmount += netPurchaseAmount;
    totalGrossPurchaseAmount += grossPurchaseAmount;

    const instanceTotalQuantity = initMdbWrapperInput({
        selector: '#totalQuantityDisplayInput',
        value: totalQuantity
    });
    const instanceTotalNetPurchaseAmount = initMdbWrapperInput({
        selector: '#totalNetPurchaseAmountDisplayInput',
        value: totalNetPurchaseAmount
    });
    const instanceTotalGrossPurchaseAmount = initMdbWrapperInput({
        selector: '#totalGrossPurchaseAmountDisplayInput',
        value: totalGrossPurchaseAmount
    });

    updateMdbWrapperInput(instanceTotalQuantity);
    updateMdbWrapperInput(instanceTotalNetPurchaseAmount);
    updateMdbWrapperInput(instanceTotalGrossPurchaseAmount);
}

export const cleanAddedProduct = () => {

    $('#productInput').empty().trigger('change');
    document.querySelector('#quantityInput').value = '';
    document.querySelector('#unitCostByQuantityInput').value = '';
    document.querySelector('#presentationDisplayInput').value = '';
}

on('click', '#addProductBtn', addProduct);
