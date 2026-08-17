import {
    editGoodsIssue,
    editGoodsIssueDetails,
    editGoodsIssueHeader,
    registerGoodsIssue,
    returnGoodsIssueDetail
} from "../../../application/warehouse/goodsIssues/goodsIssues.js";
import { addGoodsIssueMaterialValidation, issueProjectQuantityDetailsValidation, goodsIssueValidation } from "../../../utils/validations/validators.js";
import { createGoodsIssueDatatable } from "../../../plugins/datatable/goodsIssueDatatable.js";
import { getGoodsIssueHeaderSelects } from "../../../plugins/select2/modules/goodsIssueSelect.js";
import { clearAddedMaterialInput, normalizeFormErrors } from "../../../ui/formUI.js";
import { on } from "../../../utils/domUtils.js";
import { setDateTimePickerValue } from "../../../plugins/flatpickr/dateTimePicker.js";
import { hasValidationErrors, validateDetailsFields, validateFields } from "../../../utils/formUtils.js";
import { openModal } from "../../../ui/modalUI.js";
import { DATATABLE_SELECTORS, FORM_SELECTORS, MODAL_SELECTORS } from "../../../constants/selectors.js";
import { FORM_MODES } from "../../../constants/formModes.js";
import { hasMaterialDimensions, roundTo } from "../../../utils/formatUtils.js";
import { applyIssueModalMode, bindIssueProjectQuantityControls, createIssueHeaderForm, createIssueTableActions, getPendingIssueSupplyDetails, initializeIssueModal, mapIssueSupplyDetails, useIssueForm } from "../../../ui/issues/issueFormUI.js";
import { createIssueReturn } from "../../../ui/issues/issueReturnUI.js";
import { mapGoodsIssueDetailDisplay } from "../../../utils/warehouse/issueDisplayUtils.js";
import { createWarehouseIssueDetailsTable } from '../../../plugins/datatable/warehouseIssueDetailDatatable.js';
import { refreshMaterialTable } from '../../../plugins/datatable/utils/renderMaterialDatatable.js';

const modalId = MODAL_SELECTORS.GOODS_ISSUE;
const formId = FORM_SELECTORS.GOODS_ISSUE;
const GOODS_ISSUE_ENTITY_NAME = 'salida';

const context = window.meta || {};
const form = document.querySelector(formId);
const modalElement = document.querySelector(modalId);
const detailTableSelector = DATATABLE_SELECTORS.MATERIAL;
const details = [];
let currentGoodsIssue = null;

const renderIssueDetails = () => createWarehouseIssueDetailsTable({
    data: details,
    mode: form.dataset.mode,
    context
});

const issueHeaderForm = createIssueHeaderForm({
    formSelector: formId,
    selects: getGoodsIssueHeaderSelects()
});
const goodsIssueReturn = createIssueReturn({
    prefix: 'goodsIssue',
    sendReturn: returnGoodsIssueDetail
});

goodsIssueReturn.initialize();

const normalizeGoodsIssueData = ({ form, formData }) => {

    const { mode } = form.dataset;

    if (mode === FORM_MODES.EDIT_DETAIL) {
        return {
            id: form.dataset.id,
            details: mapIssueSupplyDetails(details)
        };
    }

    if (mode === FORM_MODES.EDIT_HEADER) return formData;

    return {
        ...formData,
        details: details.map(({ materialId, supplierId, presentationId, quantity }) => ({
            materialId,
            supplierId,
            ...(presentationId && { presentationId }),
            quantity
        }))
    };
};

useIssueForm({
    selector: formId,
    normalizeData: normalizeGoodsIssueData,
    getErrors: ({ form, formData }) => {

        const { mode } = form.dataset;

        if (mode === FORM_MODES.EDIT_DETAIL) {
            const detailsToSupply = getPendingIssueSupplyDetails(details);

            return detailsToSupply.length
                ? validateDetailsFields(issueProjectQuantityDetailsValidation, detailsToSupply)
                : { details: 'Seleccione al menos un material pendiente por surtir.' };
        }

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
                ...display,
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

    renderIssueDetails();

    openModal(modalElement);
};

createGoodsIssueDatatable({
    context,
    ...createIssueTableActions({ openIssueModal: openGoodsIssueModal })
});

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

    if (!hasMaterialDimensions({ base: materialBase, height: materialHeight })) {

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

    const existingIndex = details.findIndex(detail => (
        detail.materialId === materialId && detail.supplierId === supplierId
    ));

    if (existingIndex >= 0) details.splice(existingIndex, 1, material);
    else details.push(material);

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
on('click', `${ detailTableSelector } .delete-btn`, (event, button) => {
    const index = details.findIndex(detail => detail.materialId === button.dataset.id);

    if (index < 0) return;

    details.splice(index, 1);
    refreshMaterialTable(details);
});
bindIssueProjectQuantityControls({
    form,
    tableSelector: detailTableSelector,
    findDetail: findDetailByElement
});


on('click', '#materialTable .return-issue-detail-btn', (event, button) => {
    const detail = details.find(item => item.id === button.dataset.id);

    if (!detail || !currentGoodsIssue) return;

    goodsIssueReturn.open({ issue: currentGoodsIssue, detail });
});
