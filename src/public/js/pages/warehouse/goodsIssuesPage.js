import { useForm } from "../../application/form.js";
import { editGoodsIssue, editGoodsIssueDetails, editGoodsIssueHeader, registerGoodsIssue } from "../../application/warehouse/goodsIssues/goodsIssues.js";
import { validateAddGoodsIssueProductValidators, validateGoodsIssueDetailValidators, validateGoodsIssueValidators } from "../../utils/validations/validators.js";
import { refreshProductTable } from "../../plugins/datatable/baseDatatable.js";
import { createGoodsIssueDatatable, details, initDetailsGoodsIssueTable } from "../../plugins/datatable/goodsIssueDatatable.js";
import { initGoodsIssueFormSelect2, setGoodsIssueFormSelectOptions, syncGoodsIssueDependentSelectsState } from "../../plugins/select2/modules/goodsIssueSelect.js";
import { setFormReadOnly, toggleButtons, clearAddedProductInput, clearFormErrors, normalizeFormErrors, initForm } from "../../ui/formUI.js";
import { on } from "../../utils/domUtils.js";
import { setDateTimePickerValue } from "../../plugins/flatpickr/dateTimePicker.js";
import { handleSubmit, hasValidationErrors, syncCheckboxControlledInputs, toggleDisabledElement, validateDetailsFields, validateFields } from "../../utils/formUtils.js";
import { buildModalTitle, openModal } from "../../ui/modalUI.js";
import { hasPermission } from "../../utils/permissions.js";
import { FORM_SELECTORS, MODAL_SELECTORS } from "../../constants/selectors.js";
import { FORM_MODES } from "../../constants/formModes.js";
import { FULFILLMENT_STATUS_NAMES } from "../../constants/fulfillmentStatuses.js";
import { formatDecimal, roundTo } from "../../utils/formatUtils.js";
import { initGoodsIssueReturnModal, openGoodsIssueReturnModal } from "./goodsIssues/returnModal.js";

const HEADER_FIELD_NAMES = ['clientId', 'advisorId', 'departmentId', 'requesterId', 'projectNumber', 'requestDate', 'observations'];
const ENABLED_HEADER_MODES = [FORM_MODES.CREATE, FORM_MODES.EDIT, FORM_MODES.EDIT_HEADER];
const modalId = MODAL_SELECTORS.GOODS_ISSUE;
const formId = FORM_SELECTORS.GOODS_ISSUE;
const GOODS_ISSUE_ENTITY_NAME = 'salida';

const context = window.meta || {};
let currentGoodsIssue = null;

createGoodsIssueDatatable(context);
initGoodsIssueReturnModal();


const setGoodsIssueHeaderFieldsReadOnly = ({ form, isReadOnly }) => {

    HEADER_FIELD_NAMES.forEach(fieldName => {
        const field = form.elements[fieldName];

        if (!field) return;

        toggleDisabledElement({
            element: field,
            isDisabled: isReadOnly
        });
    });
};

const getDetailsTableMode = (mode) => mode === FORM_MODES.EDIT_HEADER ? FORM_MODES.VIEW : mode;


const normalizeGoodsIssueData = ({ form, formData }) => {

    const { mode } = form.dataset;

    if (mode === FORM_MODES.EDIT_DETAIL) {
        return {
            id: form.dataset.id,
            details: details.filter(detail => detail.isSupplied && !detail.originalIsSupplied)
                .map(({ id, isSupplied, projectConvertedQuantity }) => ({
                    id,
                    isSupplied,
                    projectConvertedQuantity
                }))
        };
    }

    if (mode === FORM_MODES.EDIT_HEADER) return formData;

    return {
        ...formData,
        details
    };
};

useForm({
    selector: formId,
    normalizeData: normalizeGoodsIssueData,
    getErrors: ({ form, formData }) => {

        const { mode } = form.dataset;

        if (mode === FORM_MODES.EDIT_DETAIL) return validateDetailsFields(validateGoodsIssueDetailValidators, details);

        const errors = validateFields(validateGoodsIssueValidators, formData);

        if (mode === FORM_MODES.EDIT_HEADER) errors.details = null;

        return errors;
    },
    sendRequest: async ({ formData, form }) => {

        const update = form.dataset.mode === FORM_MODES.EDIT_DETAIL
            ? editGoodsIssueDetails
            : form.dataset.mode === FORM_MODES.EDIT_HEADER
                ? editGoodsIssueHeader
                : editGoodsIssue;

        await handleSubmit({
            form,
            formData,
            create: registerGoodsIssue,
            update
        });
    },
});


export const openGoodsIssueModal = ({ mode, data = null }) => {

    const form = document.querySelector(formId);
    const modalElement = document.querySelector(modalId);

    currentGoodsIssue = data;

    initForm({ form, mode, id: data?.id || '' });
    clearFormErrors(form);
    toggleButtons({
        mode,
        status: data?.status?.name,
        showActions: false,
        withTotal: false,
        showAddProduct: mode === FORM_MODES.CREATE || (mode === FORM_MODES.EDIT && data?.fulfillmentStatus?.name === FULFILLMENT_STATUS_NAMES.PENDING)
    });
    setFormReadOnly({ form, isReadOnly: false });
    initGoodsIssueFormSelect2();
    setGoodsIssueFormSelectOptions(data);
    setGoodsIssueHeaderFieldsReadOnly({
        form,
        isReadOnly: !ENABLED_HEADER_MODES.includes(mode)
    });
    syncGoodsIssueDependentSelectsState();

    details.length = 0;

    if (mode === FORM_MODES.CREATE) {

        form.reset();
        syncGoodsIssueDependentSelectsState();
        modalElement.querySelector('#modalTitle').textContent = 'Registrar salida';
        form.querySelector('#submitBtn').textContent = 'Guardar';
        form.querySelector('#presentationDisplayInput').value = '';
    }

    if (mode === FORM_MODES.EDIT || mode === FORM_MODES.EDIT_DETAIL || mode === FORM_MODES.EDIT_HEADER || mode === FORM_MODES.VIEW) {

        form.querySelector('#observationsInput').value = data.observations || '';
        setDateTimePickerValue(form.querySelector('#requestDateInput'), data.requestDate);
        form.querySelector('#projectNumberInput').value = data.projectNumber;
        details.push(...data.details.map(detail => ({
            id: detail.id,
            productId: detail.productId,
            supplierId: detail.supplierId,
            presentationId: detail.presentationId,
            unitMeasureId: detail.unitMeasureId,
            productName: detail.productName,
            productBase: detail.productBase,
            productHeight: detail.productHeight,
            quantity: detail.quantity,
            presentationName: detail.presentationName,
            convertedQuantity: detail.convertedQuantity,
            unitMeasureId: detail.unitMeasureId,
            unitMeasureName: detail.unitMeasureName,
            unitMeasureSymbol: detail.unitMeasureSymbol,
            maxUnitCost: detail.maxUnitCost,
            projectConvertedQuantity: detail.projectConvertedQuantity,
            convertedQuantityDifference: detail.convertedQuantityDifference,
            supplierName: detail.supplierName,
            suppliedQuantity: detail.suppliedQuantity,
            returnedQuantity: detail.returnedQuantity,
            isSupplied: detail.isSupplied,
            fulfillmentStatus: detail.fulfillmentStatus,
            originalIsSupplied: detail.isSupplied,
            originalProjectConvertedQuantity: detail.projectConvertedQuantity ?? null,
            originalConvertedQuantityDifference: detail.convertedQuantityDifference ?? null
        })));

        setFormReadOnly({ form, isReadOnly: mode !== FORM_MODES.EDIT && mode !== FORM_MODES.EDIT_HEADER });
        setGoodsIssueHeaderFieldsReadOnly({
            form,
            isReadOnly: !ENABLED_HEADER_MODES.includes(mode)
        });
        syncGoodsIssueDependentSelectsState();

        if (mode === FORM_MODES.EDIT || mode === FORM_MODES.EDIT_HEADER) {

            modalElement.querySelector('#modalTitle').textContent = buildModalTitle({ action: 'Editar', entityName: GOODS_ISSUE_ENTITY_NAME, referenceNumber: data?.referenceNumber });
            form.querySelector('#submitBtn').textContent = 'Editar';

        }

        if (mode === FORM_MODES.EDIT_DETAIL) {

            modalElement.querySelector('#modalTitle').textContent = buildModalTitle({ action: 'Editar detalles de la', entityName: GOODS_ISSUE_ENTITY_NAME, referenceNumber: data?.referenceNumber });
            form.querySelector('#submitBtn').textContent = 'Surtir';
        }


        if (mode === FORM_MODES.VIEW) {
            
            modalElement.querySelector('#modalTitle').textContent = buildModalTitle({ action: 'Ver', entityName: GOODS_ISSUE_ENTITY_NAME, referenceNumber: data?.referenceNumber });
        }
    }

    initDetailsGoodsIssueTable(getDetailsTableMode(mode), context);

    openModal(modalElement);
};

const addProduct = () => {

    const option = document.querySelector(`${ FORM_SELECTORS.PRODUCT } option:checked`);

    let { productBase, productHeight, presentationName, unitMeasureName, productName, supplierName, supplierId, maxUnitCost } = option?.dataset || {};
    productHeight = Number(productHeight);
    productBase = Number(productBase);

    const productId = option?.value;
    const quantity = Number(document.querySelector(FORM_SELECTORS.QUANTITY).value);

    const errors = validateFields(validateAddGoodsIssueProductValidators, {
        productId,
        supplierId,
        quantity
    });

    normalizeFormErrors({ form: document.querySelector(formId), errors });

    if (hasValidationErrors(errors)) return;

    if (!option) return null;

    let convertedQuantity;

    if (!productBase || !productHeight) {

        productBase = null;
        productHeight = null;
        convertedQuantity = quantity;

    } else {

        convertedQuantity = roundTo(productBase * productHeight * quantity);
    }

    const product = {
        productId,
        productName,
        productBase,
        productHeight,
        quantity,
        unitMeasureName,
        presentationName,
        convertedQuantity,
        supplierName,
        maxUnitCost,
        supplierId,
    };

    details.push(product);

    refreshProductTable(details);
    clearAddedProductInput();
};

const findDetailByElement = (element) => {

    const { detailId } = element.dataset;

    if (detailId) {
        const detail = details.find(item => item.id === detailId);

        if (detail) return detail;

        return details.find(item => item.productId === detailId);
    }

    return details.find(detail => detail.productId === element.dataset.id);
};

on('click', '#addProductBtn', addProduct);
on('change', '.supply-checkbox', (e, checkbox) => {

    const product = findDetailByElement(checkbox);

    if (!product) return;

    product.isSupplied = checkbox.checked;

    if (!checkbox.checked) {
        product.projectConvertedQuantity = product.originalProjectConvertedQuantity ?? null;
        product.convertedQuantityDifference = product.originalConvertedQuantityDifference ?? null;
    }

    syncCheckboxControlledInputs({
        root: document.querySelector(formId),
        inputSelector: '.project-converted-quantity-input',
        detailId: checkbox.dataset.detailId,
        isChecked: checkbox.checked
    });

    const projectQuantityInput = document.querySelector(`.project-converted-quantity-input[data-detail-id="${ checkbox.dataset.detailId }"]`);

    if (projectQuantityInput && !checkbox.checked) {
        projectQuantityInput.value = product.projectConvertedQuantity ?? '';

        const currentTd = projectQuantityInput.closest('td');
        const nextTd = currentTd?.nextElementSibling;

        if (nextTd) nextTd.textContent = product.convertedQuantityDifference ?? '';
    }
});
on('input', '.project-converted-quantity-input', (e, input) => {

    const value = Number(input.value);
    const product = findDetailByElement(input);

    if (!product) return;

    product.projectConvertedQuantity = value;
    product.convertedQuantityDifference = roundTo(product.convertedQuantity - product.projectConvertedQuantity);

    const currentTd = input.closest('td');
    const nextTd = currentTd.nextElementSibling;

    if (nextTd) nextTd.textContent = formatDecimal(product.convertedQuantityDifference);
});


on('click', '#productTable .return-issue-detail-btn', (event, button) => {
    const detail = details.find(item => item.id === button.dataset.id);

    if (!detail || !currentGoodsIssue) return;

    openGoodsIssueReturnModal({
        goodsIssue: currentGoodsIssue,
        detail,
        issueDetails: details
    });
});
