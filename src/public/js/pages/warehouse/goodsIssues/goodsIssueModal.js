import { FORM_MODES } from '../../../constants/formModes.js';
import {
    FORM_SELECTORS,
    INPUT_SELECTORS,
    MODAL_SELECTORS
} from '../../../constants/selectors.js';
import { setDateTimePickerValue } from '../../../plugins/flatpickr/dateTimePicker.js';
import { createWarehouseIssueDetailsTable } from '../../../plugins/datatable/shared/issues/warehouseIssueDetailDatatable.js';
import { getGoodsIssueHeaderSelects } from '../../../plugins/select2/modules/goodsIssueSelect.js';
import {
    applyIssueModalMode,
    createIssueHeaderForm,
    initializeIssueModal
} from '../../../ui/issues/issueFormUI.js';
import { openModal } from '../../../ui/modalUI.js';
import { mapIssueDetailToTable } from '../../../utils/warehouseInventoryUtils.js';
import { initializeGoodsIssueReturns } from './returns/goodsIssueReturn.js';

const modalId = MODAL_SELECTORS.GOODS_ISSUE;
const formId = FORM_SELECTORS.GOODS_ISSUE;
const GOODS_ISSUE_ENTITY_NAME = 'salida';

const context = window.meta || {};
const form = document.querySelector(formId);
const modalElement = document.querySelector(modalId);
export const goodsIssueDetails = [];
const details = goodsIssueDetails;
let currentGoodsIssue = null;

const issueHeaderForm = createIssueHeaderForm({
    formSelector: formId,
    selects: getGoodsIssueHeaderSelects()
});
initializeGoodsIssueReturns({
    details,
    getCurrentIssue: () => currentGoodsIssue
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
        setDateTimePickerValue(form.querySelector(INPUT_SELECTORS.REQUEST_DATE), data.requestDate);
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
