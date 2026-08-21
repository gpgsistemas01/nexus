import { FORM_MODES } from '../../../constants/formModes.js';
import { UI_PERMISSIONS } from '../../../constants/permissions.js';
import {
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
import { openModal } from '../../../ui/modalUI.js';
import { mapIssueDetailToTable } from '../../../utils/warehouseInventoryUtils.js';
import { initializeWasteIssueReturns } from './returns/wasteIssueReturn.js';

const modalId = MODAL_SELECTORS.WASTE_ISSUE;
const formId = FORM_SELECTORS.WASTE_ISSUE;
const WASTE_ISSUE_ENTITY_NAME = 'salida de merma';

const context = window.meta || {};
const form = document.querySelector(formId);
const modalElement = document.querySelector(modalId);
export const wasteIssueDetails = [];
export const wasteIssueHeaderForm = createIssueHeaderForm({
    formSelector: formId,
    selects: getWasteIssueHeaderSelects()
});
initializeWasteIssueReturns({
    details: wasteIssueDetails,
    getIssueId: () => form.dataset.id
});

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

setCurrentRequestDate();
