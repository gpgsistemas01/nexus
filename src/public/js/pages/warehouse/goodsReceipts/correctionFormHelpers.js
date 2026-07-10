import { correctGoodsReceiptDetail } from "../../../application/warehouse/goodsReceipts.js";
import { PRODUCT_SELECT_RESULTS_LIMIT } from "../../../application/warehouse/products.js";
import { handleApiError } from "../../../api/errorHandler.js";
import { initMdbModal } from "../../../plugins/mdb/baseInstance.js";
import { initReasonSelect } from "../../../plugins/select2/domains/reason.js";
import { setupProductSelect, toggleProductOption } from "../../../plugins/select2/domains/product.js";
import { notifications } from "../../../plugins/swal/swalComponent.js";
import { reloadMainTable } from "../../../plugins/datatable/baseDatatable.js";
import { on } from "../../../utils/domUtils.js";

const CORRECTION_MODAL_SELECTOR = '#goodsReceiptCorrectionModal';
const CORRECTION_FORM_SELECTOR = '#goodsReceiptCorrectionForm';
const CORRECTION_PRODUCT_SELECTOR = '#correctionProductInput';
const CORRECTION_REASON_SELECTOR = '#correctionReasonInput';
const CORRECTION_SUPPLIER_SELECTOR = '#correctionSupplierInput';
const CORRECTION_IMPACT_SELECTOR = '#correctionImpactContainer';
const CORRECTION_CURRENT_DATA_SELECTOR = '#correctionCurrentDataBody';
const CORRECTION_DETAIL_BUTTON_SELECTOR = '#productTable .correct-detail-btn';

const toMoney = (value) => `$${ Number(value || 0).toFixed(2) }`;
const toNumberValue = (value) => Number(value || 0);
const getCorrectionFormData = (form) => Object.fromEntries(new FormData(form).entries());

const setSelectOption = ({ select, id, text }) => {
    if (!select) return;

    if (select.tagName === 'SELECT') {
        select.innerHTML = `<option value="${ id }" selected>${ text }</option>`;
        return;
    }

    select.value = id;
};

const buildCurrentDataRows = (detail) => `
    <tr><th>Producto registrado</th><td>${ detail.productName }</td></tr>
    <tr><th>Stock ingresado</th><td>${ detail.quantity }</td></tr>
    <tr><th>Costo presentación</th><td>${ toMoney(detail.costPerUnitType) }</td></tr>
    <tr><th>Monto s/ IVA</th><td>${ toMoney(detail.netPurchaseAmount) }</td></tr>
    <tr><th>Monto c/ IVA</th><td>${ toMoney(detail.grossPurchaseAmount) }</td></tr>
    <tr><th>Disponible para validar</th><td>${ detail.availableReturnQuantity ?? detail.quantity }</td></tr>
`;

const buildImpactTable = ({ detail, correctedProductName, productId, quantity, cost }) => {
    const currentQuantity = toNumberValue(detail.quantity);
    const currentCost = toNumberValue(detail.costPerUnitType);
    const currentTotal = currentQuantity * currentCost;
    const correctedTotal = quantity * cost;

    return `
        <table class="table table-sm table-bordered mb-0">
            <thead>
                <tr><th>Concepto</th><th>Registrado</th><th>Corregido</th><th>Diferencia</th></tr>
            </thead>
            <tbody>
                <tr><td>Producto</td><td>${ detail.productName }</td><td>${ correctedProductName }</td><td>${ detail.productId === productId ? 'Sin cambio' : 'Cambio' }</td></tr>
                <tr><td>Cantidad/stock</td><td>${ currentQuantity }</td><td>${ quantity || 0 }</td><td>${ (quantity - currentQuantity).toFixed(2) }</td></tr>
                <tr><td>Costo presentación</td><td>${ toMoney(currentCost) }</td><td>${ toMoney(cost) }</td><td>${ toMoney(cost - currentCost) }</td></tr>
                <tr><td>Total s/ IVA</td><td>${ toMoney(currentTotal) }</td><td>${ toMoney(correctedTotal) }</td><td>${ toMoney(correctedTotal - currentTotal) }</td></tr>
            </tbody>
        </table>
        <div class="alert alert-info mt-2 mb-0">
            Se generará un ajuste de salida para el producto registrado y un ajuste de entrada para el producto corregido. Si el costo cambió, quedará documentado como diferencia compensatoria.
        </div>
    `;
};

export const createGoodsReceiptCorrectionHandlers = ({ details, parentModalSelector }) => {
    let correctionReceipt = null;
    let correctionDetail = null;

    const getModal = () => document.querySelector(CORRECTION_MODAL_SELECTOR);
    const getForm = () => document.querySelector(CORRECTION_FORM_SELECTOR);

    const renderImpact = () => {
        const form = getForm();
        const container = document.querySelector(CORRECTION_IMPACT_SELECTOR);
        if (!form || !container || !correctionDetail) return;

        const data = getCorrectionFormData(form);
        const option = form.querySelector(`${ CORRECTION_PRODUCT_SELECTOR } option:checked`);

        container.innerHTML = buildImpactTable({
            detail: correctionDetail,
            correctedProductName: option?.textContent?.trim() || correctionDetail.productName,
            productId: data.productId,
            quantity: toNumberValue(data.quantity),
            cost: toNumberValue(data.costPerUnitType)
        });
    };

    const initCorrectionSelects = ({ modal, receipt, detail }) => {
        setSelectOption({
            select: modal.querySelector(CORRECTION_SUPPLIER_SELECTOR),
            id: receipt.supplierId,
            text: receipt.supplierName
        });

        setupProductSelect({
            modalSelector: CORRECTION_MODAL_SELECTOR,
            supplierSelector: CORRECTION_SUPPLIER_SELECTOR,
            productSelector: CORRECTION_PRODUCT_SELECTOR,
            allowCreate: false,
            resultsLimit: PRODUCT_SELECT_RESULTS_LIMIT
        });

        toggleProductOption({
            selector: `${ CORRECTION_MODAL_SELECTOR } ${ CORRECTION_PRODUCT_SELECTOR }`,
            data: { id: detail.productId, text: detail.productName }
        });

        initReasonSelect({
            modalSelector: CORRECTION_MODAL_SELECTOR,
            baseSelector: `${ CORRECTION_MODAL_SELECTOR } ${ CORRECTION_REASON_SELECTOR }`,
            allowCreate: false,
            data: () => ({ search: 'Corrección de compra' })
        });
    };

    const openCorrectionModal = ({ receipt, detail }) => {
        correctionReceipt = receipt;
        correctionDetail = detail;

        const modal = getModal();
        const form = getForm();

        form.reset();
        form.dataset.id = receipt.id;
        form.elements.detailId.value = detail.id;
        form.elements.quantity.value = detail.quantity;
        form.elements.costPerUnitType.value = detail.costPerUnitType;
        form.elements.observations.value = `Corrección de compra ${ receipt.referenceNumber }: producto/costo registrado incorrectamente.`;
        form.elements.confirmCorrection.checked = false;

        document.querySelector(CORRECTION_CURRENT_DATA_SELECTOR).innerHTML = buildCurrentDataRows(detail);

        initCorrectionSelects({ modal, receipt, detail });
        renderImpact();
        initMdbModal(modal).show();
    };

    const validateStockAvailability = () => {
        const availableStock = toNumberValue(correctionDetail?.availableReturnQuantity ?? correctionDetail?.quantity);
        const originalQuantity = toNumberValue(correctionDetail?.quantity);

        if (availableStock >= originalQuantity) return true;

        notifications.showModal({
            title: 'Corrección no disponible',
            text: 'El producto registrado ya tuvo movimientos posteriores o devoluciones. Revise el kardex antes de corregirlo.',
            icon: 'warning'
        });

        return false;
    };

    const submitCorrection = async (event) => {
        event.preventDefault();

        const form = event.currentTarget;
        const formData = getCorrectionFormData(form);

        if (!form.elements.confirmCorrection.checked) {
            notifications.showWarning('Debe confirmar que entiende el impacto de la corrección.');
            return;
        }

        if (!validateStockAvailability()) return;

        try {
            await correctGoodsReceiptDetail({
                id: form.dataset.id,
                formData: {
                    detailId: formData.detailId,
                    productId: formData.productId,
                    quantity: Number(formData.quantity),
                    costPerUnitType: Number(formData.costPerUnitType),
                    reasonId: formData.reasonId,
                    observations: formData.observations
                }
            });

            notifications.showSuccess('Corrección de compra registrada correctamente.');
            initMdbModal(getModal()).hide();
            initMdbModal(document.querySelector(parentModalSelector)).hide();
            reloadMainTable();
        } catch (err) {
            handleApiError({ err, form, rethrow: false });
        }
    };

    const bindEvents = () => {
        on('click', CORRECTION_DETAIL_BUTTON_SELECTOR, (event, button) => {
            const detail = details.find(item => item.id === button.dataset.id);
            if (!detail || !correctionReceipt) return;

            openCorrectionModal({ receipt: correctionReceipt, detail });
        });

        on('input', `${ CORRECTION_FORM_SELECTOR } input, ${ CORRECTION_FORM_SELECTOR } textarea`, renderImpact);
        on('change', `${ CORRECTION_FORM_SELECTOR } select, ${ CORRECTION_FORM_SELECTOR } input`, renderImpact);

        document.querySelector(CORRECTION_FORM_SELECTOR)?.addEventListener('submit', submitCorrection);
    };

    return {
        bindEvents,
        setReceipt: (receipt) => {
            correctionReceipt = receipt;
        }
    };
};
