import { DOM_EVENT_NAMES } from '../../../constants/events.js';
import {
    editWasteIssue,
    editWasteIssueHeader,
    editWasteIssueDetails,
    registerWasteIssue,
    returnWasteIssueDetail
} from '../../../application/warehouse/wasteIssues/wasteIssues.js';
import { FORM_MODES } from '../../../constants/formModes.js';
import { UI_PERMISSIONS } from '../../../constants/permissions.js';
import {
    BUTTON_SELECTORS,
    DATATABLE_SELECTORS,
    FORM_SELECTORS,
    INPUT_SELECTORS,
    MODAL_SELECTORS,
    SELECT_SELECTORS
} from '../../../constants/selectors.js';
import { createWarehouseIssueDetailsTable } from '../../../plugins/datatable/shared/issues/warehouseIssueDetailDatatable.js';
import { refreshMaterialTable } from '../../../plugins/datatable/shared/inventory/renderMaterialDatatable.js';
import { createWasteIssueDatatable } from '../../../plugins/datatable/warehouse/wasteIssues/wasteIssueDatatable.js';
import { setDateTimePickerValue } from '../../../plugins/flatpickr/dateTimePicker.js';
import { getWasteIssueHeaderSelects } from '../../../plugins/select2/modules/wasteIssueSelect.js';
import { clearAddedItemInput } from '../../../ui/forms/detailFormUI.js';
import { normalizeFormErrors } from '../../../ui/forms/formErrorsUI.js';
import {
    applyIssueModalMode,
    bindIssueProjectQuantityControls,
    createIssueHeaderForm,
    createIssueTableActions,
    initializeIssueModal,
    useIssueForm
} from '../../../ui/issues/issueFormUI.js';
import { createIssueReturn } from '../../../ui/issues/issueReturnUI.js';
import { openModal } from '../../../ui/modalUI.js';
import { removeDetail, upsertDetail } from '../../../utils/detailCollectionUtils.js';
import { on } from '../../../utils/domUtils.js';
import { roundTo } from '../../../utils/formatUtils.js';
import { hasValidationErrors, validateDetailsFields, validateFields } from '../../../utils/formUtils.js';
import {
    addWasteIssueDetailValidation,
    issueProjectQuantityDetailsValidation,
    wasteIssueValidation
} from '../../../utils/validations/validators.js';
import {
    getBase,
    getHeight,
    getPresentation,
    getUnitMeasure,
    mapIssueDetailsToSupplyRequest,
    mapIssueDetailToTable
} from '../../../utils/warehouseInventoryUtils.js';

const modalId = MODAL_SELECTORS.WASTE_ISSUE;
const formId = FORM_SELECTORS.WASTE_ISSUE;
const WASTE_ISSUE_ENTITY_NAME = 'salida de merma';

const context = window.meta || {};
const form = document.querySelector(formId);
const modalElement = document.querySelector(modalId);
const detailTableSelector = DATATABLE_SELECTORS.MATERIAL;
const details = [];
const presentationDisplaySelector = `${ modalId } ${ INPUT_SELECTORS.PRESENTATION_DISPLAY }`;
const issueHeaderForm = createIssueHeaderForm({
    formSelector: formId,
    selects: getWasteIssueHeaderSelects()
});
const wasteIssueReturn = createIssueReturn({
    sendReturn: returnWasteIssueDetail
});

wasteIssueReturn.initialize();

const setCurrentRequestDate = () => setDateTimePickerValue(
    document.querySelector(INPUT_SELECTORS.WASTE_ISSUE_DATE),
    new Date().toISOString()
);

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
    editHeader: editWasteIssueHeader,
    editDetails: editWasteIssueDetails,
    onSaved: async () => {
        details.length = 0;
        refreshMaterialTable(details);
    }
});

export const openWasteIssueModal = ({ mode, data = null }) => {
    initializeIssueModal({ form, issueHeaderForm, mode, data });
    details.length = 0;

    if (mode === FORM_MODES.CREATE) {
        setCurrentRequestDate();
    } else {
        setDateTimePickerValue(document.querySelector(INPUT_SELECTORS.WASTE_ISSUE_DATE), data.requestDate);
        document.querySelector(INPUT_SELECTORS.OBSERVATIONS).value = data.observations || '';
        document.querySelector(INPUT_SELECTORS.PROJECT_NUMBER).value = data.projectNumber || '';

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
    });
    openModal(modalElement);
};

createWasteIssueDatatable({
    context,
    ...createIssueTableActions({ openIssueModal: openWasteIssueModal })
});

const addWaste = () => {
    const option = document.querySelector(`${ SELECT_SELECTORS.WASTE } option:checked`);

    let { id, text, base, height, supplierMaterial } = option.dataset;
    supplierMaterial = JSON.parse(supplierMaterial);
    const wasteId = option.value || id;
    const quantity = Number(document.querySelector(INPUT_SELECTORS.QUANTITY).value);

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

    upsertDetail({
        details,
        detail: waste,
        matches: item => item.wasteId === wasteId
    });

    refreshMaterialTable(details);
    clearAddedItemInput({
        itemSelector: SELECT_SELECTORS.WASTE,
        quantitySelector: INPUT_SELECTORS.QUANTITY,
        presentationSelector: presentationDisplaySelector
    });
};

const findDetailByElement = element => details.find(detail => (
    detail.id === element.dataset.detailId
    || detail.id === element.dataset.id
    || detail.wasteId === element.dataset.id
));

on(DOM_EVENT_NAMES.CLICK, BUTTON_SELECTORS.ADD_MATERIAL, addWaste);
on(DOM_EVENT_NAMES.CLICK, `${ detailTableSelector } .delete-btn`, (event, button) => {
    const removedDetail = removeDetail({
        details,
        matches: detail => detail.wasteId === button.dataset.id
    });

    if (!removedDetail) return;

    refreshMaterialTable(details);
});

bindIssueProjectQuantityControls({
    form,
    tableSelector: detailTableSelector,
    findDetail: findDetailByElement
});

on(DOM_EVENT_NAMES.CLICK, `${ detailTableSelector } .return-issue-detail-btn`, (event, button) => {
    const detail = findDetailByElement(button);

    if (detail) wasteIssueReturn.open({ issue: { id: form.dataset.id }, detail });
});

setCurrentRequestDate();
