import {
    editGoodsIssue,
    editGoodsIssueDetails,
    editGoodsIssueHeader,
    registerGoodsIssue,
    returnGoodsIssueDetail
} from "../../../application/warehouse/goodsIssues/goodsIssues.js";
import { addGoodsIssueMaterialValidation, goodsIssueDetailsValidation, goodsIssueValidation } from "../../../utils/validations/validators.js";
import { refreshMaterialTable } from "../../../plugins/datatable/utils/renderMaterialDatatable.js";
import { createGoodsIssueDatatable, details, initDetailsGoodsIssueTable } from "../../../plugins/datatable/goodsIssueDatatable.js";
import { getGoodsIssueHeaderSelects } from "../../../plugins/select2/modules/goodsIssueSelect.js";
import { clearAddedMaterialInput, normalizeFormErrors } from "../../../ui/formUI.js";
import { on } from "../../../utils/domUtils.js";
import { setDateTimePickerValue } from "../../../plugins/flatpickr/dateTimePicker.js";
import { hasValidationErrors, syncCheckboxControlledInputs, validateDetailsFields, validateFields } from "../../../utils/formUtils.js";
import { openModal } from "../../../ui/modalUI.js";
import { FORM_SELECTORS, MODAL_SELECTORS } from "../../../constants/selectors.js";
import { FORM_MODES } from "../../../constants/formModes.js";
import { formatDecimal, roundTo } from "../../../utils/formatUtils.js";
import { applyIssueModalMode, createIssueHeaderForm, initializeIssueModal, useIssueForm } from "../../../ui/issues/issueFormUI.js";
import { createIssueReturn } from "../../../ui/issues/issueReturnUI.js";
import { mapGoodsIssueDetailDisplay } from "../../../utils/warehouse/issueDisplayUtils.js";

const modalId = MODAL_SELECTORS.GOODS_ISSUE;
const formId = FORM_SELECTORS.GOODS_ISSUE;
const GOODS_ISSUE_ENTITY_NAME = 'salida';

const context = window.meta || {};
let currentGoodsIssue = null;

const issueHeaderForm = createIssueHeaderForm({
    formSelector: formId,
    selects: getGoodsIssueHeaderSelects()
});
const goodsIssueReturn = createIssueReturn({
    prefix: 'goodsIssue',
    sendReturn: returnGoodsIssueDetail
});

createGoodsIssueDatatable(context);
goodsIssueReturn.initialize();


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

useIssueForm({
    selector: formId,
    normalizeData: normalizeGoodsIssueData,
    getErrors: ({ form, formData }) => {

        const { mode } = form.dataset;

        if (mode === FORM_MODES.EDIT_DETAIL) return validateDetailsFields(goodsIssueDetailsValidation, details);

        const errors = validateFields(goodsIssueValidation, formData);

        if (mode === FORM_MODES.EDIT_HEADER) errors.details = null;

        return errors;
    },
    register: registerGoodsIssue,
    edit: editGoodsIssue,
    editDetails: editGoodsIssueDetails,
    editHeader: editGoodsIssueHeader
});


export const openGoodsIssueModal = ({ mode, data = null }) => {

    const form = document.querySelector(formId);
    const modalElement = document.querySelector(modalId);

    currentGoodsIssue = data;

    initializeIssueModal({ form, issueHeaderForm, mode, data });

    details.length = 0;

    if (mode === FORM_MODES.CREATE) {

        form.querySelector('#presentationDisplayInput').value = '';
    }

    if ([FORM_MODES.EDIT, FORM_MODES.EDIT_DETAIL, FORM_MODES.EDIT_HEADER, FORM_MODES.RETURN, FORM_MODES.VIEW].includes(mode)) {

        form.querySelector('#observationsInput').value = data.observations || '';
        setDateTimePickerValue(form.querySelector('#requestDateInput'), data.requestDate);
        form.querySelector('#projectNumberInput').value = data.projectNumber;
        const modalDetails = data.details.map(detail => {
            const display = mapGoodsIssueDetailDisplay(detail);

            return {
                id: detail.id,
                materialId: detail.materialId,
                supplierId: detail.supplierId,
                presentationId: detail.presentationId ?? detail.material?.presentation?.id ?? null,
                unitMeasureId: detail.unitMeasureId ?? detail.material?.unitMeasure?.id ?? null,
                materialName: detail.materialName,
                materialBase: display.base,
                materialHeight: display.height,
                quantity: detail.quantity,
                presentationName: display.presentationName,
                convertedQuantity: detail.convertedQuantity,
                unitMeasureName: display.unitMeasureName,
                unitMeasureSymbol: display.unitMeasureSymbol,
                maxUnitCost: detail.maxUnitCost,
                projectConvertedQuantity: detail.projectConvertedQuantity,
                convertedQuantityDifference: detail.convertedQuantityDifference,
                supplierName: display.supplierName,
                suppliedQuantity: detail.suppliedQuantity,
                returnedQuantity: detail.returnedQuantity,
                isSupplied: detail.isSupplied,
                fulfillmentStatus: detail.fulfillmentStatus,
                originalIsSupplied: detail.isSupplied,
                originalProjectConvertedQuantity: detail.projectConvertedQuantity ?? null,
                originalConvertedQuantityDifference: detail.convertedQuantityDifference ?? null
            };
        });

        details.push(...modalDetails);

    }

    applyIssueModalMode({
        form,
        modalElement,
        mode,
        entityName: GOODS_ISSUE_ENTITY_NAME,
        referenceNumber: data?.referenceNumber,
        createTitle: 'Registrar salida',
        detailAction: 'Editar detalles de la',
        returnAction: 'Devolver materiales surtidos de la'
    });

    initDetailsGoodsIssueTable(mode, context);

    openModal(modalElement);
};

const addMaterial = () => {

    const option = document.querySelector(`${ FORM_SELECTORS.MATERIAL } option:checked`);

    let { materialBase, materialHeight, presentationName, unitMeasureName, materialName, supplierName, supplierId, maxUnitCost } = option?.dataset || {};
    materialHeight = Number(materialHeight);
    materialBase = Number(materialBase);

    const materialId = option?.value;
    const quantity = Number(document.querySelector(FORM_SELECTORS.QUANTITY).value);

    const errors = validateFields(addGoodsIssueMaterialValidation, {
        materialId,
        supplierId,
        quantity
    });

    normalizeFormErrors({ form: document.querySelector(formId), errors });

    if (hasValidationErrors(errors)) return;

    if (!option) return null;

    let convertedQuantity;

    if (!materialBase || !materialHeight) {

        materialBase = null;
        materialHeight = null;
        convertedQuantity = quantity;

    } else {

        convertedQuantity = roundTo(materialBase * materialHeight * quantity);
    }

    const material = {
        materialId,
        materialName,
        materialBase,
        materialHeight,
        quantity,
        unitMeasureName,
        presentationName,
        convertedQuantity,
        supplierName,
        maxUnitCost,
        supplierId,
    };

    details.push(material);

    refreshMaterialTable(details);
    clearAddedMaterialInput();
};

const findDetailByElement = (element) => {

    const { detailId } = element.dataset;

    if (detailId) {
        const detail = details.find(item => item.id === detailId);

        if (detail) return detail;

        return details.find(item => item.materialId === detailId);
    }

    return details.find(detail => detail.materialId === element.dataset.id);
};

on('click', '#addMaterialBtn', addMaterial);
on('change', '.supply-checkbox', (e, checkbox) => {

    const material = findDetailByElement(checkbox);

    if (!material) return;

    material.isSupplied = checkbox.checked;

    if (!checkbox.checked) {
        material.projectConvertedQuantity = material.originalProjectConvertedQuantity ?? null;
        material.convertedQuantityDifference = material.originalConvertedQuantityDifference ?? null;
    }

    syncCheckboxControlledInputs({
        root: document.querySelector(formId),
        inputSelector: '.project-converted-quantity-input',
        detailId: checkbox.dataset.detailId,
        isChecked: checkbox.checked
    });

    const projectQuantityInput = document.querySelector(`.project-converted-quantity-input[data-detail-id="${ checkbox.dataset.detailId }"]`);

    if (projectQuantityInput && !checkbox.checked) {
        projectQuantityInput.value = material.projectConvertedQuantity ?? '';

        const currentTd = projectQuantityInput.closest('td');
        const nextTd = currentTd?.nextElementSibling;

        if (nextTd) nextTd.textContent = material.convertedQuantityDifference ?? '';
    }
});
on('input', '.project-converted-quantity-input', (e, input) => {

    const value = Number(input.value);
    const material = findDetailByElement(input);

    if (!material) return;

    material.projectConvertedQuantity = value;
    material.convertedQuantityDifference = roundTo(material.convertedQuantity - material.projectConvertedQuantity);

    const currentTd = input.closest('td');
    const nextTd = currentTd.nextElementSibling;

    if (nextTd) nextTd.textContent = formatDecimal(material.convertedQuantityDifference);
});


on('click', '#materialTable .return-issue-detail-btn', (event, button) => {
    const detail = details.find(item => item.id === button.dataset.id);

    if (!detail || !currentGoodsIssue) return;

    goodsIssueReturn.open({ issue: currentGoodsIssue, detail });
});
