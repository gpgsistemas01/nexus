import { useForm } from "../../application/form.js";
import { editGoodsIssue, editGoodsIssueDetails, editGoodsIssueHeader, registerGoodsIssue, returnGoodsIssue } from "../../application/warehouse/goodsIssues/goodsIssues.js";
import { validateAddGoodsIssueProductValidators, validateGoodsIssueDetailValidators, validateGoodsIssueReturnValidators, validateGoodsIssueValidators } from "../../utils/validations/validators.js";
import { refreshProductTable } from "../../plugins/datatable/baseDatatable.js";
import { createGoodsIssueDatatable, details, initDetailsGoodsIssueTable } from "../../plugins/datatable/goodsIssueDatatable.js";
import { initGoodsIssueFormSelect2, setGoodsIssueFormSelectOptions, syncGoodsIssueDependentSelectsState } from "../../plugins/select2/modules/goodsIssueSelect.js";
import { setFormReadOnly, toggleButtons, clearAddedProductInput, clearFormErrors, normalizeFormErrors, initForm } from "../../ui/formUI.js";
import { on } from "../../utils/domUtils.js";
import { setDateTimePickerValue } from "../../plugins/flatpickr/dateTimePicker.js";
import { handleSubmit, hasValidationErrors, syncCheckboxControlledInputs, toggleContainerElements, toggleDisabledElement, validateDetailsFields, validateFields } from "../../utils/formUtils.js";
import { buildModalTitle, openModal } from "../../ui/modalUI.js";
import { hasPermission } from "../../utils/permissions.js";
import { FORM_SELECTORS, MODAL_SELECTORS } from "../../constants/selectors.js";
import { FORM_MODES } from "../../constants/formModes.js";
import { FULFILLMENT_STATUS_NAMES } from "../../constants/fulfillmentStatuses.js";
import { formatDecimal, roundTo } from "../../utils/formatUtils.js";
import {
    bindReturnDetailEvents,
    buildReturnDetailState,
    createReturnFormHandlers
} from "./returns/returnFormHelpers.js";
import { configureReturnModal } from "./returns/returnModalHelpers.js";

const HEADER_FIELD_NAMES = ['clientId', 'advisorId', 'departmentId', 'requesterId', 'projectNumber', 'requestDate', 'observations'];
const ENABLED_HEADER_MODES = [FORM_MODES.CREATE, FORM_MODES.EDIT, FORM_MODES.EDIT_HEADER];
const modalId = MODAL_SELECTORS.GOODS_ISSUE;
const formId = FORM_SELECTORS.GOODS_ISSUE;
const GOODS_ISSUE_ENTITY_NAME = 'salida';
const RETURN_SUBMIT_TEXT = 'Devolver';

const context = window.meta || {};

createGoodsIssueDatatable(context);


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

const returnForm = createReturnFormHandlers({
    details,
    validators: validateGoodsIssueReturnValidators,
    validateFields,
    returnUpdate: returnGoodsIssue,
    emptyMessage: 'Seleccione al menos un producto para devolver.'
});

const normalizeGoodsIssueData = ({ form, formData }) => {

    const { mode } = form.dataset;

    if (mode === FORM_MODES.EDIT_DETAIL) {
        return {
            id: form.dataset.id,
            details: details
                .filter(detail => detail.isSupplied && !detail.originalIsSupplied)
                .map(({ id, isSupplied, projectConvertedQuantity }) => ({
                    id,
                    isSupplied,
                    projectConvertedQuantity
                }))
        };
    }

    if (mode === FORM_MODES.EDIT_HEADER) return formData;

    if (returnForm.isActive(form)) return returnForm.normalizeData({ form });

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

        if (returnForm.isActive(form)) return returnForm.getErrors();

        const errors = validateFields(validateGoodsIssueValidators, formData);

        if (mode === FORM_MODES.EDIT_HEADER) errors.details = null;

        return errors;
    },
    sendRequest: async ({ formData, form }) => {

        const update = form.dataset.mode === FORM_MODES.EDIT_DETAIL
            ? editGoodsIssueDetails
            : form.dataset.mode === FORM_MODES.EDIT_HEADER
                ? editGoodsIssueHeader
                : returnForm.isActive(form)
                    ? returnGoodsIssue
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

    if (mode === FORM_MODES.EDIT || mode === FORM_MODES.EDIT_DETAIL || mode === FORM_MODES.EDIT_HEADER || mode === FORM_MODES.VIEW || mode === FORM_MODES.RETURN) {

        form.querySelector('#observationsInput').value = mode === FORM_MODES.RETURN ? '' : (data.observations || '');
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
            isSupplied: detail.isSupplied,
            originalIsSupplied: detail.isSupplied,
            ...buildReturnDetailState({
                detail,
                baseQuantity: detail.suppliedQuantity
            })
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

        if (mode === FORM_MODES.RETURN) {
            configureReturnModal({
                modalElement,
                form,
                buildModalTitle,
                referenceNumber: data?.referenceNumber,
                entityName: GOODS_ISSUE_ENTITY_NAME,
                submitText: RETURN_SUBMIT_TEXT,
                toggleContainerElements,
                setFormReadOnly,
                observationsElement: form.querySelector('#observationsInput')
            });

            setGoodsIssueHeaderFieldsReadOnly({
                form,
                isReadOnly: true
            });
            syncGoodsIssueDependentSelectsState();
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

    syncCheckboxControlledInputs({
        root: document.querySelector(formId),
        inputSelector: '.project-converted-quantity-input',
        detailId: checkbox.dataset.detailId,
        isChecked: checkbox.checked
    });
});
on('input', '.project-converted-quantity-input', (e, input) => {

    const value = Number(input.value);
    const product = findDetailByElement(input);

    if (!product) return;

    product.projectConvertedQuantity = value;
    product.convertedQuantityDifference = roundTo(product.convertedQuantity - product.projectConvertedQuantity);

    const currenTd = input.closest('td');
    const nextTd = currenTd.nextElementSibling;

    if (nextTd) nextTd.textContent = formatDecimal(product.convertedQuantityDifference);
});

bindReturnDetailEvents({
    details
});
