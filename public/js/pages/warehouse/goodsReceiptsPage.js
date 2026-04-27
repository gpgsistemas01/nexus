import { useForm } from "../../application/form.js";
import { registerGoodsReceipt } from "../../application/warehouse/goodsReceipts.js";
import { validateGoodsReceiptValidators } from "../../utils/validations/validators.js";
import { refreshProductTable } from "../../plugins/datatable/baseDatatable.js";
import { createGoodsReceiptDatatable, details, initDetailsGoodsReceiptTable } from "../../plugins/datatable/goodsReceiptDatatable.js";
import { initGoodsReceiptFormSelect2, setGoodsReceiptFormSelectOptions } from "../../plugins/select2/modules/goodsReceiptSelect.js";
import { toggleInputSelectErrors, toggleTableErrors, setFormReadOnly, updateTotals, toggleButtons } from "../../ui/formUI.js";
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

        formData.isInvoiced = document.querySelector('input[name="isInvoiced"]').checked;

        if (!formData.isInvoiced) delete formData.invoice;

        formData.details = details;
    },
    getErrors: (formData) => {
        
        const allowedUsername = /^[a-zA-Z0-9\-]+$/;
        let errors = {};

        errors = validateFields(validateGoodsReceiptValidators, formData);

        if (formData.isInvoiced) {

            if (!formData.invoice) errors.invoice = 'El número de factura es obligatorio';
            else if (typeof formData.invoice !== 'string') errors.invoice = 'El número de factura no es una cadena de texto';
            else if (!allowedUsername.test(formData.invoice)) errors.invoice = 'El número de factura debe tener solo letras, números y guiones.';
            else if (formData.invoice.length > 50) errors.invoice = 'El número de factura no debe exceder los 50 caracteres';
            else errors.invoice = null;

        } else {

            errors.invoice = null;
        }

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

        toggleButtons({
            mode,
            status: 'Abierta',
            showActions: true
        });
    }

    if (mode === 'view') {

        form.querySelector('#observationsInput').value = data.observations || '';
        form.querySelector('#receptionDateInput').value = formatDateLongWithTime(data.receptionDate);
        details.push(...data?.details.map(detail => ({
            id: detail.id,
            productId: detail.product.id,
            name: detail.product.name,
            base: detail.product.base,
            height: detail.product.height,
            quantity: detail.quantity,
            presentation: detail.product.presentation.name,
            totalArea: detail.totalArea,
            unitMeasure: detail.product.unitMeasure.name,
            unitCostByArea: detail.unitCostByArea,
            area: detail.product.area,
            unitCostByQuantity: detail.unitCostByQuantity,
            netPurchaseAmount: detail.netPurchaseAmount,
            grossPurchaseAmount: detail.grossPurchaseAmount,
        })));

        setGoodsReceiptFormSelectOptions(data);

        modalElement.querySelector('#modalTitle').textContent = 'Ver compra';
        setFormReadOnly({ form, isReadOnly: true });

        toggleButtons({
            mode,
            status: 'Confirmada',
            showActions: false
        });
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
    const { presentation, unitMeasure } = selectedProduct;

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
        unitMeasure,
        presentation,
        unitCostByQuantity,
        unitCostByArea,
        netPurchaseAmount,
        grossPurchaseAmount,
        totalArea,
    };
    details.push(product);

    refreshProductTable(details);
    cleanAddedProduct();

    updateTotals({
        quantity,
        net: netPurchaseAmount,
        gross: grossPurchaseAmount,
        operation: 'add'
    });
}

export const cleanAddedProduct = () => {

    $('#productInput').empty().trigger('change');
    document.querySelector('#quantityInput').value = '';
    document.querySelector('#unitCostByQuantityInput').value = '';
    document.querySelector('#presentationDisplayInput').value = '';
}

on('click', '#addProductBtn', addProduct);

const invoiceContainer = document.getElementById('invoiceContainer');
const invoiceRadios = document.querySelectorAll('input[name="isInvoiced"]');

invoiceRadios.forEach(radio => {

    radio.addEventListener('change', () => {

        if (radio.value === 'invoice' && radio.checked) {

            invoiceContainer.style.display = '';
            document.getElementById('invoiceInput').value = '';

        } else if (radio.value === 'none' && radio.checked) {

            invoiceContainer.style.display = 'none';
        }
    });
});