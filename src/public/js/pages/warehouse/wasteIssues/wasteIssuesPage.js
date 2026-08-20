import {
    editWasteIssue,
    editWasteIssueDetails,
    editWasteIssueHeader,
    registerWasteIssue,
    returnWasteIssueDetail
} from '../../../application/warehouse/wasteIssues/wasteIssues.js';
import { createIssueReturn } from '../../../ui/issues/issueReturnUI.js';
import { handleApiError } from '../../../api/errorHandler.js';
import { openModal } from '../../../ui/modalUI.js';
import { createWasteIssueDatatable } from '../../../plugins/datatable/wasteIssueDatatable.js';
import { setDateTimePickerValue } from '../../../plugins/flatpickr/dateTimePicker.js';
import { FORM_MODES } from '../../../constants/formModes.js';
import { DATATABLE_SELECTORS, FORM_SELECTORS, MODAL_SELECTORS } from '../../../constants/selectors.js';
import { hasValidationErrors, validateDetailsFields, validateFields } from '../../../utils/formUtils.js';
import { addWasteIssueDetailValidation, issueProjectQuantityDetailsValidation, wasteIssueValidation } from '../../../utils/validations/validators.js';
import { clearAddedItemInput, normalizeFormErrors } from '../../../ui/formUI.js';
import { setMdbWrapperInputValue } from '../../../plugins/select2/baseSelect.js';
import { applyIssueModalMode, bindIssueProjectQuantityControls, createIssueHeaderForm, createIssueTableActions, initializeIssueModal, useIssueForm } from '../../../ui/issues/issueFormUI.js';
import { getWasteIssueHeaderSelects } from '../../../plugins/select2/modules/wasteIssueSelect.js';
import { createWarehouseIssueDetailsTable } from '../../../plugins/datatable/warehouseIssueDetailDatatable.js';
import { roundTo } from '../../../utils/formatUtils.js';
import { on } from '../../../utils/domUtils.js';
import { UI_PERMISSIONS } from '../../../constants/permissions.js';
import { refreshMaterialTable } from '../../../plugins/datatable/utils/renderMaterialDatatable.js';
import { buildInventorySelectText, getBase, getHeight, getPresentation, getUnitMeasure, mapIssueDetailsToSupplyRequest, mapIssueDetailToTable } from '../../../utils/warehouseInventoryUtils.js';

const formId = FORM_SELECTORS.WASTE_ISSUE;
const modalId = MODAL_SELECTORS.WASTE_ISSUE;
const WASTE_ISSUE_ENTITY_NAME = 'salida de merma';

const form = document.querySelector(formId);
const context = window.meta || {};
const wasteSelect = document.querySelector(FORM_SELECTORS.WASTE_INPUT);
const details = [];
const modalElement = document.querySelector(modalId);
const detailTableSelector = DATATABLE_SELECTORS.MATERIAL;
const presentationDisplaySelector = `${ modalId } ${ FORM_SELECTORS.PRESENTATION_DISPLAY }`;
const issueHeaderForm = createIssueHeaderForm({
    formSelector: formId,
    selects: getWasteIssueHeaderSelects()
});
const wasteIssueReturn = createIssueReturn({
    prefix: 'wasteIssue',
    sendReturn: returnWasteIssueDetail
});

const setCurrentRequestDate = () => setDateTimePickerValue(
    document.querySelector(FORM_SELECTORS.WASTE_ISSUE_DATE),
    new Date().toISOString()
);

export const openWasteIssueModal = ({ mode, data = null }) => {

    initializeIssueModal({ form, issueHeaderForm, mode, data });
    details.length = 0;

    if (mode === FORM_MODES.CREATE) {
        setCurrentRequestDate();
    } else {
        setDateTimePickerValue(document.querySelector(FORM_SELECTORS.WASTE_ISSUE_DATE), data.requestDate);
        document.querySelector(FORM_SELECTORS.OBSERVATIONS_INPUT).value = data.observations || '';
        document.querySelector(FORM_SELECTORS.PROJECT_NUMBER).value = data.projectNumber || '';

        details.push(...data.details.map(mapIssueDetailToTable));
    }

    applyIssueModalMode({
        form,
        modalElement,
        mode,
        entityName: WASTE_ISSUE_ENTITY_NAME,
        referenceNumber: data?.referenceNumber,
        createTitle: 'Registrar salida de merma'
    });

    createWarehouseIssueDetailsTable({
        data: details,
        mode: form.dataset.mode,
        context,
        projectQuantityPermission: UI_PERMISSIONS.WASTE_ISSUES_SUPPLY
    })
    openModal(modalElement);
};

const addWaste = () => {

    const option = document.querySelector(`${ FORM_SELECTORS.WASTE_INPUT } option:checked`);

    let { id, text, base, height, supplierMaterial } = option.dataset;
    supplierMaterial = JSON.parse(supplierMaterial);
    const wasteId = option.value || id;
    const quantity = Number(document.querySelector(FORM_SELECTORS.QUANTITY_INPUT).value);

    const errors = validateFields(addWasteIssueDetailValidation, {
        wasteId,
        quantity
    });

    normalizeFormErrors({ form, errors });

    if (hasValidationErrors(errors)) return;

    const waste = {
        wasteId,
        name: text,
        base,
        height,
        presentation: getPresentation(supplierMaterial),
        unitMeasure: getUnitMeasure(supplierMaterial),
        quantity,
        convertedQuantity: base && height
            ? roundTo(base * height * quantity)
            : quantity
    };

    const existingIndex = details.findIndex(item => item.wasteId === wasteId);

    if (existingIndex >= 0) details.splice(existingIndex, 1, waste);
    else details.push(waste);

    refreshMaterialTable(details);
    clearAddedItemInput({
        itemSelector: FORM_SELECTORS.WASTE_INPUT,
        quantitySelector: FORM_SELECTORS.QUANTITY_INPUT,
        presentationSelector: presentationDisplaySelector
    });
};

const findDetailByElement = element => details.find(detail => (
    detail.id === element.dataset.detailId
    || detail.id === element.dataset.id
    || detail.wasteId === element.dataset.id
));

on('click', '#addMaterialBtn', addWaste);
on('click', `${ detailTableSelector } .delete-btn`, (event, button) => {
    const index = details.findIndex(detail => detail.wasteId === button.dataset.id);

    if (index < 0) return;

    details.splice(index, 1);
    refreshMaterialTable(details);
});

bindIssueProjectQuantityControls({
    form,
    tableSelector: detailTableSelector,
    findDetail: findDetailByElement
});

on('click', `${ detailTableSelector } .return-issue-detail-btn`, (event, button) => {
    const detail = findDetailByElement(button);

    if (detail) wasteIssueReturn.open({ issue: { id: form.dataset.id }, detail });
});

const normalizeWasteIssueData = ({ form }) => {

    const { mode } = form.dataset;

    if (mode === FORM_MODES.EDIT_DETAIL) {
        return {
            details: mapIssueDetailsToSupplyRequest(details)
        };
    }

    const formData = issueHeaderForm.readData();

    if (mode !== FORM_MODES.EDIT_HEADER) {
        formData.details = details.map(({ wasteId, quantity }) => ({
            wasteId,
            quantity
        }));
    }

    return formData;
};

useIssueForm({
    selector: formId,
    normalizeData: normalizeWasteIssueData,
    getErrors: ({ form, formData }) => {

        if (form.dataset.mode === FORM_MODES.EDIT_DETAIL) {
            const detailsToSupply = mapIssueDetailsToSupplyRequest(details);

            return detailsToSupply.length
                ? validateDetailsFields(issueProjectQuantityDetailsValidation, detailsToSupply)
                : { details: 'Seleccione al menos una merma pendiente por surtir.' };
        }

        const errors = validateFields(wasteIssueValidation, formData);

        if (form.dataset.mode === FORM_MODES.EDIT_HEADER) errors.details = null;

        return errors;
    },
    register: registerWasteIssue,
    edit: editWasteIssue,
    editDetails: editWasteIssueDetails,
    editHeader: editWasteIssueHeader,
    onSaved: async () => {
        details.length = 0;
        refreshMaterialTable(details);
    }
});

createWasteIssueDatatable({
    context,
    ...createIssueTableActions({ openIssueModal: openWasteIssueModal })
});

wasteIssueReturn.initialize();
setCurrentRequestDate();
