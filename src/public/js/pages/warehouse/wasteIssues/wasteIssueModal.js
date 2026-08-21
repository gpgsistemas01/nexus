import { returnWasteIssueDetail } from '../../../application/warehouse/wasteIssues/wasteIssues.js';
import { DOM_EVENT_NAMES } from '../../../constants/events.js';
import { FORM_MODES } from '../../../constants/formModes.js';
import { UI_PERMISSIONS } from '../../../constants/permissions.js';
import {
    DATATABLE_SELECTORS,
    FORM_SELECTORS,
    INPUT_SELECTORS,
    MODAL_SELECTORS
} from '../../../constants/selectors.js';
import { createWarehouseIssueDetailsTable } from '../../../plugins/datatable/shared/issues/warehouseIssueDetailDatatable.js';
import { setDateTimePickerValue } from '../../../plugins/flatpickr/dateTimePicker.js';
import { getWasteIssueHeaderSelects } from '../../../plugins/select2/modules/wasteIssueSelect.js';
import {
    applyIssueModalMode,
    createIssueHeaderForm,
    initializeIssueModal
} from '../../../ui/issues/issueFormUI.js';
import { createIssueReturn } from '../../../ui/issues/issueReturnUI.js';
import { openModal } from '../../../ui/modalUI.js';
import { on } from '../../../utils/domUtils.js';
import { mapIssueDetailToTable } from '../../../utils/warehouseInventoryUtils.js';

const modalId = MODAL_SELECTORS.WASTE_ISSUE;
const formId = FORM_SELECTORS.WASTE_ISSUE;
const WASTE_ISSUE_ENTITY_NAME = 'salida de merma';

const context = window.meta || {};
const form = document.querySelector(formId);
const modalElement = document.querySelector(modalId);
const detailTableSelector = DATATABLE_SELECTORS.MATERIAL;
export const wasteIssueDetails = [];
export const wasteIssueHeaderForm = createIssueHeaderForm({
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

export const openWasteIssueModal = ({ mode, data = null }) => {
    initializeIssueModal({ form, issueHeaderForm: wasteIssueHeaderForm, mode, data });
    wasteIssueDetails.length = 0;

    if (mode === FORM_MODES.CREATE) {
        setCurrentRequestDate();
    } else {
        setDateTimePickerValue(document.querySelector(INPUT_SELECTORS.WASTE_ISSUE_DATE), data.requestDate);
        document.querySelector(INPUT_SELECTORS.OBSERVATIONS).value = data.observations || '';
        document.querySelector(INPUT_SELECTORS.PROJECT_NUMBER).value = data.projectNumber || '';

        wasteIssueDetails.push(...data.details.map(mapIssueDetailToTable));
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
        data: wasteIssueDetails,
        mode: form.dataset.mode,
        context,
        projectQuantityPermission: UI_PERMISSIONS.WASTE_ISSUES_SUPPLY
    });
    openModal(modalElement);
};

const findDetailByElement = element => wasteIssueDetails.find(detail => (
    detail.id === element.dataset.detailId
    || detail.id === element.dataset.id
    || detail.wasteId === element.dataset.id
));

on(DOM_EVENT_NAMES.CLICK, `${ detailTableSelector } .return-issue-detail-btn`, (event, button) => {
    const detail = findDetailByElement(button);

    if (detail) wasteIssueReturn.open({ issue: { id: form.dataset.id }, detail });
});

setCurrentRequestDate();
