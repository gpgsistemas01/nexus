import { DOM_EVENT_NAMES } from '../../../constants/events.js';
import {
    editGoodsIssue,
    editGoodsIssueDetails,
    editGoodsIssueHeader,
    registerGoodsIssue,
    returnGoodsIssueDetail
} from "../../../application/warehouse/goodsIssues/goodsIssues.js";
import { addGoodsIssueMaterialValidation, issueProjectQuantityDetailsValidation, goodsIssueValidation } from "../../../utils/validations/validators.js";
import { createGoodsIssueDatatable } from "../../../plugins/datatable/warehouse/goodsIssues/goodsIssueDatatable.js";
import { getGoodsIssueHeaderSelects } from "../../../plugins/select2/modules/goodsIssueSelect.js";
import { normalizeFormErrors } from "../../../ui/forms/formErrorsUI.js";
import { clearAddedMaterialInput } from "../../../ui/forms/detailFormUI.js";
import { on } from "../../../utils/domUtils.js";
import { setDateTimePickerValue } from "../../../plugins/flatpickr/dateTimePicker.js";
import { hasValidationErrors, validateDetailsFields, validateFields } from "../../../utils/formUtils.js";
import { openModal } from "../../../ui/modalUI.js";
import { BUTTON_SELECTORS, DATATABLE_SELECTORS, FORM_SELECTORS, INPUT_SELECTORS, MODAL_SELECTORS, SELECT_SELECTORS } from "../../../constants/selectors.js";
import { FORM_MODES } from "../../../constants/formModes.js";
import { roundTo } from "../../../utils/formatUtils.js";
import { applyIssueModalMode, bindIssueProjectQuantityControls, createIssueHeaderForm, createIssueTableActions, initializeIssueModal, useIssueForm } from "../../../ui/issues/issueFormUI.js";
import { createIssueReturn } from "../../../ui/issues/issueReturnUI.js";
import { createWarehouseIssueDetailsTable } from '../../../plugins/datatable/shared/issues/warehouseIssueDetailDatatable.js';
import { refreshMaterialTable } from '../../../plugins/datatable/shared/inventory/renderMaterialDatatable.js';
import { buildInventorySelectText, getBase, getHeight, getMaxUnitCost, getPresentation, getUnitMeasure, mapGoodsIssueDetailsToRequest, mapIssueDetailsToSupplyRequest, mapIssueDetailToTable } from "../../../utils/warehouseInventoryUtils.js";
import { removeDetail, upsertDetail } from "../../../utils/detailCollectionUtils.js";

const modalId = MODAL_SELECTORS.GOODS_ISSUE;
const formId = FORM_SELECTORS.GOODS_ISSUE;
const GOODS_ISSUE_ENTITY_NAME = 'salida';

const context = window.meta || {};
const form = document.querySelector(formId);
const modalElement = document.querySelector(modalId);
const detailTableSelector = DATATABLE_SELECTORS.MATERIAL;
const details = [];
let currentGoodsIssue = null;

const issueHeaderForm = createIssueHeaderForm({
    formSelector: formId,
    selects: getGoodsIssueHeaderSelects()
});
const goodsIssueReturn = createIssueReturn({
    sendReturn: returnGoodsIssueDetail
});

goodsIssueReturn.initialize();

const normalizeGoodsIssueData = ({ form, formData }) => {

    const { mode } = form.dataset;

    if (mode === FORM_MODES.EDIT_DETAIL) {
        return {
            id: form.dataset.id,
            details: mapIssueDetailsToSupplyRequest(details)
        };
    }

    if (mode === FORM_MODES.EDIT_HEADER) return formData;

    return {
        ...formData,
        details: mapGoodsIssueDetailsToRequest(details)
    };
};

useIssueForm({
    selector: formId,
    normalizeData: normalizeGoodsIssueData,
    getErrors: ({ form, formData }) => {

        const { mode } = form.dataset;

        if (mode === FORM_MODES.EDIT_DETAIL) {
            const detailsToSupply = mapIssueDetailsToSupplyRequest(details);

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

        form.querySelector(INPUT_SELECTORS.PRESENTATION_DISPLAY).value = '';
    }

    if ([FORM_MODES.EDIT, FORM_MODES.EDIT_DETAIL, FORM_MODES.EDIT_HEADER, FORM_MODES.RETURN, FORM_MODES.VIEW].includes(mode)) {

        form.querySelector(INPUT_SELECTORS.OBSERVATIONS).value = data.observations || '';
        setDateTimePickerValue(form.querySelector('#requestDateInput'), data.requestDate);
        form.querySelector(INPUT_SELECTORS.PROJECT_NUMBER).value = data.projectNumber;
        const modalDetails = data.details.map(mapIssueDetailToTable);

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

    createWarehouseIssueDetailsTable({
        data: details,
        mode: form.dataset.mode,
        context
    });

    openModal(modalElement);
};

createGoodsIssueDatatable({
    context,
    ...createIssueTableActions({ openIssueModal: openGoodsIssueModal })
});

const addMaterial = () => {

    const option = document.querySelector(`${ SELECT_SELECTORS.MATERIAL } option:checked`);

    let { text, material, supplier, maxUnitCost } = option.dataset || {};
    material = JSON.parse(material);
    supplier = JSON.parse(supplier);
    const quantity = Number(document.querySelector(INPUT_SELECTORS.QUANTITY).value);

    const errors = validateFields(addGoodsIssueMaterialValidation, {
        materialId: material.id,
        supplierId: supplier.id,
        quantity
    });

    normalizeFormErrors({ form: document.querySelector(formId), errors });

    if (hasValidationErrors(errors)) return;

    if (!option) return null;

    const newMaterial = {
        materialId: material.id,
        name: text,
        base: getBase(material),
        height: getHeight(material),
        quantity,
        unitMeasure: getUnitMeasure(material),
        presentation: getPresentation(material),
        convertedQuantity: (!material.base || !material.height)
            ? quantity
            : roundTo(material.base * material.height * quantity),
        supplier: supplier.name,
        maxUnitCost,
        supplierId: supplier.id
    };

    upsertDetail({
        details,
        detail: newMaterial,
        matches: detail => detail.materialId === material.id && detail.supplierId === supplier.id
    });

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

on(DOM_EVENT_NAMES.CLICK, BUTTON_SELECTORS.ADD_MATERIAL, addMaterial);
on(DOM_EVENT_NAMES.CLICK, `${ detailTableSelector } .delete-btn`, (event, button) => {
    const removedDetail = removeDetail({
        details,
        matches: detail => detail.materialId === button.dataset.id
    });

    if (!removedDetail) return;

    refreshMaterialTable(details);
});
bindIssueProjectQuantityControls({
    form,
    tableSelector: detailTableSelector,
    findDetail: findDetailByElement
});

on(DOM_EVENT_NAMES.CLICK, '#materialTable .return-issue-detail-btn', (event, button) => {
    const detail = details.find(item => item.id === button.dataset.id);

    if (!detail || !currentGoodsIssue) return;

    goodsIssueReturn.open({ issue: currentGoodsIssue, detail });
});
