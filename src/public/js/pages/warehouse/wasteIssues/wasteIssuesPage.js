import {
    editWasteIssue,
    editWasteIssueDetails,
    editWasteIssueHeader,
    registerWasteIssue,
    returnWasteIssueDetail
} from '../../../application/warehouse/wasteIssues/wasteIssues.js';
import { createIssueReturn } from '../../../ui/issues/issueReturnUI.js';
import { handleApiError } from '../../../api/errorHandler.js';
import { buildModalTitle, openModal } from '../../../ui/modalUI.js';
import { createWasteIssueDatatable } from '../../../plugins/datatable/wasteIssueDatatable.js';
import { setDateTimePickerValue } from '../../../plugins/flatpickr/dateTimePicker.js';
import { FULFILLMENT_STATUS_NAMES } from '../../../constants/fulfillmentStatuses.js';
import { FORM_MODES } from '../../../constants/formModes.js';
import { createIssueHeaderSelects } from '../../../plugins/select2/modules/issueHeaderSelect.js';
import { hasValidationErrors, validateFields } from '../../../utils/formUtils.js';
import { addWasteIssueDetailValidation, issueHeaderValidation, wasteIssueValidation } from '../../../utils/validations/validators.js';
import { clearAddedItemInput, normalizeFormErrors } from '../../../ui/formUI.js';
import { setMdbWrapperInputValue } from '../../../plugins/select2/baseSelect.js';
import { createIssueHeaderForm, useIssueForm } from '../../../ui/issues/issueFormUI.js';
import { mapWasteIssueDetailDisplay } from '../../../utils/warehouse/issueDisplayUtils.js';
import { renderWasteIssueDetails } from '../../../plugins/datatable/wasteIssueDetailDatatable.js';
import { createWasteIssueSelect } from '../../../plugins/select2/modules/wasteIssueSelect.js';

const form = document.querySelector('#wasteIssueForm');
const context = window.meta || {};
const wasteSelect = document.querySelector('#wasteIssueWaste');
const quantityInput = document.querySelector('#wasteIssueQuantity');
const draft = new Map();
const modalElement = document.querySelector('#wasteIssueModal');
const modalTitle = modalElement.querySelector('#modalTitle');
const presentationDisplaySelector = '#wasteIssueModal #presentationDisplayInput';
const headerSelects = createIssueHeaderSelects({
    modalSelector: '#wasteIssueModal',
    formSelector: '#wasteIssueForm',
    selectors: {
        requester: '#requesterInput',
        client: '#clientInput',
        department: '#departmentInput',
        advisor: '#advisorInput',
        projectNumber: '#projectNumberInput'
    }
});
const issueHeaderForm = createIssueHeaderForm({
    formSelector: '#wasteIssueForm',
    selects: headerSelects
});
const wasteIssueSelect = createWasteIssueSelect({
    selector: '#wasteIssueWaste',
    modalSelector: '#wasteIssueModal'
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
    document.querySelector('#wasteIssueDate'),
    new Date().toISOString()
);

const renderDraft = () => renderWasteIssueDetails({
    data: [...draft.values()],
    mode: form.dataset.mode
});

const toggleDetailFields = (visible) => {
    modalElement.querySelector('.modal-detail-controls')?.classList.toggle('d-none', !visible);
    modalElement.querySelector('#wasteIssueDraftTable_wrapper')?.classList.toggle('d-none', !visible);
};

const openCreateModal = () => {
    form.reset();
    setPresentationDisplay('');
    form.dataset.mode = FORM_MODES.CREATE;
    delete form.dataset.id;
    draft.clear();
    renderDraft();
    toggleDetailFields(true);
    issueHeaderForm.initialize();
    setCurrentRequestDate();
    modalTitle.textContent = 'Registrar salida de merma';
    openModal(modalElement);
};

const openEditModal = (issue) => {
    form.reset();
    setPresentationDisplay('');

    const canEditDetails = issue.fulfillmentStatus?.name === FULFILLMENT_STATUS_NAMES.PENDING;
    form.dataset.mode = canEditDetails ? FORM_MODES.EDIT : FORM_MODES.EDIT_HEADER;
    form.dataset.id = issue.id;
    setDateTimePickerValue(document.querySelector('#wasteIssueDate'), issue.requestDate);
    document.querySelector('#wasteIssueObservations').value = issue.observations || '';
    document.querySelector('#projectNumberInput').value = issue.projectNumber || '';
    draft.clear();
    if (canEditDetails) issue.details.map(mapWasteIssueDetailDisplay).forEach(detail => draft.set(detail.wasteId, {
        wasteId: detail.wasteId,
        materialName: detail.materialName,
        supplierName: detail.supplierName,
        base: detail.base,
        height: detail.height,
        presentationName: detail.presentationName,
        unitMeasureName: detail.unitMeasureName,
        unitMeasureSymbol: detail.unitMeasureSymbol,
        quantity: Number(detail.quantity)
    }));
    renderDraft();
    toggleDetailFields(canEditDetails);
    issueHeaderForm.initialize({ data: issue });
    modalTitle.textContent = buildModalTitle({ action: 'Editar', entityName: 'salida de merma', referenceNumber: issue.referenceNumber });
    openModal(modalElement);
};

wasteSelect.addEventListener('change', () => {

    const waste = wasteIssueSelect.getSelected();

    setPresentationDisplay(waste?.presentation?.name || '');
});

document.querySelector('#addMaterialBtn').addEventListener('click', () => {

    const waste = wasteIssueSelect.getSelected();
    const quantity = Number(quantityInput.value);
    const errors = validateFields(addWasteIssueDetailValidation, {
        wasteId: waste?.id,
        quantity: quantityInput.value
    });

    normalizeFormErrors({ form, errors });

    if (hasValidationErrors(errors)) return;

    draft.set(waste.id, {
        wasteId: waste.id,
        materialName: waste.materialName,
        supplierName: waste.supplier?.tradeName,
        base: waste.base,
        height: waste.height,
        presentationName: waste.presentation?.name,
        unitMeasureName: waste.unitMeasure?.name,
        unitMeasureSymbol: waste.unitMeasure?.symbol,
        quantity
    });

    renderDraft();

    clearAddedItemInput({
        itemSelector: '#wasteIssueWaste',
        quantitySelector: '#wasteIssueQuantity',
        presentationSelector: presentationDisplaySelector
    });
});

document.querySelector('#wasteIssueDraftTable').addEventListener('click', event => {
    const button = event.target.closest('.js-remove');
    if (!button) return;
    draft.delete(button.dataset.id);
    renderDraft();
});

const openSupplyModal = issue => {
    form.reset();
    form.dataset.mode = FORM_MODES.EDIT_DETAIL;
    form.dataset.id = issue.id;
    draft.clear();
    issue.details.map(mapWasteIssueDetailDisplay).forEach(detail => draft.set(detail.id, {
        ...detail,
        originalIsSupplied: detail.isSupplied
    }));
    toggleDetailFields(false);
    modalElement.querySelector('#wasteIssueDraftTable_wrapper')?.classList.remove('d-none');
    renderDraft();
    issueHeaderForm.initialize({ data: issue, isDisabled: true });
    modalTitle.textContent = buildModalTitle({ action: 'Surtir', entityName: 'salida de merma', referenceNumber: issue.referenceNumber });
    openModal(modalElement);
};

const openReturnDetailsModal = issue => {
    form.reset();
    form.dataset.mode = FORM_MODES.RETURN;
    form.dataset.id = issue.id;
    draft.clear();
    issue.details.map(mapWasteIssueDetailDisplay).forEach(detail => draft.set(detail.id, detail));
    toggleDetailFields(false);
    modalElement.querySelector('#wasteIssueDraftTable_wrapper')?.classList.remove('d-none');
    renderDraft();
    issueHeaderForm.initialize({ data: issue, isDisabled: true });
    modalTitle.textContent = buildModalTitle({ action: 'Devolver', entityName: 'salida de merma', referenceNumber: issue.referenceNumber });
    openModal(modalElement);
};

document.querySelector('#wasteIssueDraftTable').addEventListener('change', event => {
    const checkbox = event.target.closest('.supply-checkbox');
    if (!checkbox) return;
    const detail = draft.get(checkbox.dataset.detailId);
    if (detail) detail.isSupplied = checkbox.checked;
});

document.querySelector('#wasteIssueDraftTable').addEventListener('click', event => {
    const button = event.target.closest('.js-return-detail');
    if (!button) return;
    const detail = draft.get(button.dataset.id);
    if (detail) wasteIssueReturn.open({ issue: { id: form.dataset.id }, detail });
});

const normalizeWasteIssueData = ({ form }) => {

    const { mode } = form.dataset;

    if (mode === FORM_MODES.EDIT_DETAIL) {
        return {
            details: [...draft.values()]
                .filter(detail => detail.isSupplied && !detail.originalIsSupplied)
                .map(detail => ({
                    id: detail.id,
                    isSupplied: detail.isSupplied
                }))
        };
    }

    const formData = issueHeaderForm.readData();

    if (mode !== FORM_MODES.EDIT_HEADER) {
        formData.details = [...draft.values()].map(({ wasteId, quantity }) => ({
            wasteId,
            quantity
        }));
    }

    return formData;
};

useIssueForm({
    selector: '#wasteIssueForm',
    normalizeData: normalizeWasteIssueData,
    getErrors: ({ form, formData }) => {

        if (form.dataset.mode === FORM_MODES.EDIT_DETAIL) {
            return {
                details: formData.details.length
                    ? null
                    : 'Seleccione al menos una merma pendiente por surtir.'
            };
        }

        const validation = form.dataset.mode === FORM_MODES.EDIT_HEADER
            ? issueHeaderValidation
            : wasteIssueValidation;
        const errors = validateFields(validation, formData);

        return errors;
    },
    register: registerWasteIssue,
    edit: editWasteIssue,
    editDetails: editWasteIssueDetails,
    editHeader: editWasteIssueHeader,
    onSaved: async () => {
        draft.clear();
        renderDraft();
        await wasteIssueSelect.initialize();
    }
});

createWasteIssueDatatable({
    context,
    onCreate: openCreateModal,
    onEdit: openEditModal,
    onEditDetails: openSupplyModal,
    onReturnDetails: openReturnDetailsModal
});

wasteIssueReturn.initialize();
setCurrentRequestDate();
wasteIssueSelect.initialize().catch(error => handleApiError({ err: error, rethrow: false }));
