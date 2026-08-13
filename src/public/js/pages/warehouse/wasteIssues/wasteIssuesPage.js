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
import { createIssueHeaderSelects } from '../../../plugins/select2/modules/issueHeaderSelect.js';
import { hasValidationErrors, validateDetailsFields, validateFields } from '../../../utils/formUtils.js';
import { addWasteIssueDetailValidation, issueProjectQuantityDetailsValidation, wasteIssueValidation } from '../../../utils/validations/validators.js';
import { clearAddedItemInput, normalizeFormErrors } from '../../../ui/formUI.js';
import { setMdbWrapperInputValue } from '../../../plugins/select2/baseSelect.js';
import { applyIssueModalMode, bindIssueProjectQuantityControls, createIssueHeaderForm, createIssueTableActions, getPendingIssueSupplyDetails, initializeIssueModal, mapIssueSupplyDetails, useIssueForm } from '../../../ui/issues/issueFormUI.js';
import { mapWasteIssueDetailDisplay } from '../../../utils/warehouse/issueDisplayUtils.js';
import { createWasteIssueSelect } from '../../../plugins/select2/modules/wasteIssueSelect.js';
import { createWarehouseIssueDetailsTable } from '../../../plugins/datatable/warehouseIssueDetailDatatable.js';
import { roundTo } from '../../../utils/formatUtils.js';
import { on } from '../../../utils/domUtils.js';
import { UI_PERMISSIONS } from '../../../constants/permissions.js';

const formId = FORM_SELECTORS.WASTE_ISSUE;
const modalId = MODAL_SELECTORS.WASTE_ISSUE;
const WASTE_ISSUE_ENTITY_NAME = 'salida de merma';

const form = document.querySelector(formId);
const context = window.meta || {};
const wasteSelect = document.querySelector(FORM_SELECTORS.WASTE_ISSUE_WASTE);
const quantityInput = document.querySelector(FORM_SELECTORS.WASTE_ISSUE_QUANTITY);
const details = [];
const modalElement = document.querySelector(modalId);
const detailTableSelector = DATATABLE_SELECTORS.MATERIAL;
const presentationDisplaySelector = `${ modalId } ${ FORM_SELECTORS.PRESENTATION_DISPLAY }`;
const headerSelects = createIssueHeaderSelects({
    modalSelector: modalId,
    formSelector: formId,
    selectors: {
        requester: FORM_SELECTORS.REQUESTER,
        client: FORM_SELECTORS.CLIENT,
        department: FORM_SELECTORS.DEPARTMENT,
        advisor: FORM_SELECTORS.ADVISOR,
        projectNumber: FORM_SELECTORS.PROJECT_NUMBER
    }
});
const issueHeaderForm = createIssueHeaderForm({
    formSelector: formId,
    selects: headerSelects
});
const wasteIssueSelect = createWasteIssueSelect({
    selector: FORM_SELECTORS.WASTE_ISSUE_WASTE,
    modalSelector: modalId
});
const wasteIssueReturn = createIssueReturn({
    prefix: 'wasteIssue',
    sendReturn: returnWasteIssueDetail
});
const setPresentationDisplay = value => setMdbWrapperInputValue({
    selector: presentationDisplaySelector,
    value
});

const setCurrentRequestDate = () => setDateTimePickerValue(
    document.querySelector(FORM_SELECTORS.WASTE_ISSUE_DATE),
    new Date().toISOString()
);

const renderIssueDetails = () => createWarehouseIssueDetailsTable({
    data: details,
    mode: form.dataset.mode,
    context,
    projectQuantityPermission: UI_PERMISSIONS.WASTE_ISSUES_SUPPLY
});

const mapWasteIssueDetail = detail => {
    const display = mapWasteIssueDetailDisplay(detail);

    return {
        ...display,
        projectConvertedQuantity: detail.projectConvertedQuantity,
        convertedQuantityDifference: detail.convertedQuantityDifference,
        originalProjectConvertedQuantity: detail.projectConvertedQuantity ?? null,
        originalConvertedQuantityDifference: detail.convertedQuantityDifference ?? null,
        originalIsSupplied: detail.isSupplied
    };
};

export const openWasteIssueModal = ({ mode, data = null }) => {
    initializeIssueModal({ form, issueHeaderForm, mode, data });
    setPresentationDisplay('');
    details.length = 0;

    if (mode === FORM_MODES.CREATE) {
        setCurrentRequestDate();
    } else {
        setDateTimePickerValue(document.querySelector(FORM_SELECTORS.WASTE_ISSUE_DATE), data.requestDate);
        document.querySelector(FORM_SELECTORS.WASTE_ISSUE_OBSERVATIONS).value = data.observations || '';
        document.querySelector(FORM_SELECTORS.PROJECT_NUMBER).value = data.projectNumber || '';

        details.push(...data.details.map(mapWasteIssueDetail));

    }

    applyIssueModalMode({
        form,
        modalElement,
        mode,
        entityName: WASTE_ISSUE_ENTITY_NAME,
        referenceNumber: data?.referenceNumber,
        createTitle: 'Registrar salida de merma'
    });

    renderIssueDetails();
    openModal(modalElement);
};

on('change', FORM_SELECTORS.WASTE_ISSUE_WASTE, () => {

    const waste = wasteIssueSelect.getSelected();

    setPresentationDisplay(waste?.presentation?.name || '');
});

const addWaste = () => {

    const waste = wasteIssueSelect.getSelected();
    const quantity = Number(quantityInput.value);
    const errors = validateFields(addWasteIssueDetailValidation, {
        wasteId: waste?.id,
        quantity: quantityInput.value
    });

    normalizeFormErrors({ form, errors });

    if (hasValidationErrors(errors)) return;

    const detail = {
        wasteId: waste.id,
        materialId: waste.id,
        materialName: waste.materialName,
        supplierName: waste.supplier?.tradeName,
        materialBase: waste.base,
        materialHeight: waste.height,
        presentationName: waste.presentation?.name,
        unitMeasureName: waste.unitMeasure?.name,
        unitMeasureSymbol: waste.unitMeasure?.symbol,
        quantity,
        convertedQuantity: waste.base && waste.height
            ? roundTo(Number(waste.base) * Number(waste.height) * quantity)
            : quantity
    };

    const existingIndex = details.findIndex(item => item.wasteId === waste.id);

    if (existingIndex >= 0) details.splice(existingIndex, 1, detail);
    else details.push(detail);

    renderIssueDetails();

    clearAddedItemInput({
        itemSelector: FORM_SELECTORS.WASTE_ISSUE_WASTE,
        quantitySelector: FORM_SELECTORS.WASTE_ISSUE_QUANTITY,
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
    renderIssueDetails();
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
            details: mapIssueSupplyDetails(details)
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
            const detailsToSupply = getPendingIssueSupplyDetails(details);

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
        renderIssueDetails();
        await wasteIssueSelect.initialize();
    }
});

createWasteIssueDatatable({
    context,
    ...createIssueTableActions({ openIssueModal: openWasteIssueModal })
});

wasteIssueReturn.initialize();
setCurrentRequestDate();
wasteIssueSelect.initialize().catch(error => handleApiError({ err: error, rethrow: false }));
