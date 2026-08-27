import { DOM_EVENT_NAMES } from '../../constants/events.js';
import { BUTTON_SELECTORS, HEADING_SELECTORS } from '../../constants/selectors.js';
import { useForm } from '../forms/formUI.js';
import { FORM_MODES, ISSUE_HEADER_ENABLED_MODES } from '../../constants/formModes.js';
import { FULFILLMENT_STATUS_NAMES, GOODS_ISSUE_STATUS_NAMES } from '../../constants/fulfillmentStatuses.js';
import { handleSubmit, syncCheckboxControlledInputs, toggleDisabledElement } from '../../utils/formUtils.js';
import { on } from '../../utils/domUtils.js';
import { formatDecimal, roundTo } from '../../utils/formatUtils.js';
import { setFormDisabled } from '../forms/formStateUI.js';
import { toggleDetailFormActions } from '../forms/detailFormUI.js';
import { initializeInventoryCrudModal } from '../inventory/inventoryCrudModalUI.js';
import { buildModalTitle } from '../modalUI.js';

const ISSUE_HEADER_FIELD_NAMES = Object.freeze([
    'clientId',
    'advisorId',
    'departmentId',
    'requesterId',
    'projectNumber',
    'requestDate',
    'observations'
]);
const ISSUE_MODAL_MODE_CONFIG = Object.freeze({
    [FORM_MODES.CREATE]: { submitLabel: 'Guardar' },
    [FORM_MODES.EDIT]: { action: 'Editar', submitLabel: 'Editar' },
    [FORM_MODES.EDIT_HEADER]: { action: 'Editar', submitLabel: 'Editar' },
    [FORM_MODES.EDIT_DETAIL]: { actionKey: 'detailAction', submitLabelKey: 'detailAction' },
    [FORM_MODES.RETURN]: { actionKey: 'returnAction', hideSubmit: true },
    [FORM_MODES.VIEW]: { action: 'Consultar', hideSubmit: true, disableForm: true }
});

export const resolveIssueEditMode = (issue = {}) => {
    const fulfillmentStatus = issue.fulfillmentStatus?.name;

    if (
        issue.status?.name === GOODS_ISSUE_STATUS_NAMES.CANCELED
        || fulfillmentStatus === FULFILLMENT_STATUS_NAMES.CANCELED
    ) {
        return FORM_MODES.VIEW;
    }

    return fulfillmentStatus === FULFILLMENT_STATUS_NAMES.PENDING
        ? FORM_MODES.EDIT
        : FORM_MODES.EDIT_HEADER;
};

export const createIssueTableActions = ({ openIssueModal }) => ({
    onCreate: () => openIssueModal({ mode: FORM_MODES.CREATE }),
    onEdit: issue => openIssueModal({ mode: resolveIssueEditMode(issue), data: issue }),
    onEditDetails: issue => openIssueModal({ mode: FORM_MODES.EDIT_DETAIL, data: issue }),
    onReturnDetails: issue => openIssueModal({ mode: FORM_MODES.RETURN, data: issue })
});

export const bindIssueProjectQuantityControls = ({
    form,
    tableSelector,
    findDetail
}) => {
    on(DOM_EVENT_NAMES.CHANGE, `${ tableSelector } .supply-checkbox`, (_, checkbox) => {
        const detail = findDetail(checkbox);

        if (!detail) return;

        detail.isSupplied = checkbox.checked;

        if (!checkbox.checked) {
            detail.projectConvertedQuantity = null;
            detail.convertedQuantityDifference = 0;
        }

        syncCheckboxControlledInputs({
            root: form,
            inputSelector: '.project-converted-quantity-input',
            detailId: checkbox.dataset.detailId,
            isChecked: checkbox.checked
        });

        const input = form.querySelector(
            `.project-converted-quantity-input[data-detail-id="${ checkbox.dataset.detailId }"]`
        );

        if (!input || checkbox.checked) return;

        input.value = detail.projectConvertedQuantity ?? '';

        const differenceCell = input.closest('td')?.nextElementSibling;

        if (differenceCell) differenceCell.textContent = formatDecimal(detail.convertedQuantityDifference);
    });

    on(DOM_EVENT_NAMES.INPUT, `${ tableSelector } .project-converted-quantity-input`, (_, input) => {
        const detail = findDetail(input);

        if (!detail) return;

        detail.projectConvertedQuantity = Number(input.value);
        detail.convertedQuantityDifference = roundTo(
            detail.convertedQuantity - detail.projectConvertedQuantity
        );

        const differenceCell = input.closest('td')?.nextElementSibling;

        if (differenceCell) differenceCell.textContent = formatDecimal(detail.convertedQuantityDifference);
    });

};

export const initializeIssueModal = ({ form, issueHeaderForm, mode, data = null }) => {
    const isFormDisabled = Boolean(data)
        && mode !== FORM_MODES.EDIT
        && mode !== FORM_MODES.EDIT_HEADER;

    initializeInventoryCrudModal({ form, mode, data, isDisabled: isFormDisabled });
    form.querySelector(BUTTON_SELECTORS.SUBMIT)?.classList.remove('d-none');
    toggleDetailFormActions({
        mode,
        status: data?.status?.name,
        showActions: false,
        withTotal: false,
        showAddMaterial: mode === FORM_MODES.CREATE
            || (mode === FORM_MODES.EDIT && data?.fulfillmentStatus?.name === FULFILLMENT_STATUS_NAMES.PENDING)
    });
    issueHeaderForm.initialize({
        data,
        isDisabled: !ISSUE_HEADER_ENABLED_MODES.includes(mode)
    });
};

export const applyIssueModalMode = ({
    form,
    modalElement,
    mode,
    entityName,
    referenceNumber,
    createTitle,
    detailAction = 'Surtir',
    returnAction = 'Devolver'
}) => {
    const title = modalElement.querySelector(HEADING_SELECTORS.MODAL_TITLE);
    const submit = form.querySelector(BUTTON_SELECTORS.SUBMIT);

    const config = ISSUE_MODAL_MODE_CONFIG[mode];

    if (!config) return;

    const actions = { detailAction, returnAction };
    const action = config.action ?? actions[config.actionKey];
    const submitLabel = config.submitLabel ?? actions[config.submitLabelKey];

    title.textContent = mode === FORM_MODES.CREATE
        ? createTitle
        : buildModalTitle({ action, entityName, referenceNumber });

    if (submitLabel) submit.textContent = submitLabel;
    if (config.hideSubmit) submit.classList.add('d-none');
    if (config.disableForm) setFormDisabled({ form, isDisabled: true });
};

export const createIssueHeaderForm = ({
    formSelector,
    fieldNames = ISSUE_HEADER_FIELD_NAMES,
    selects
}) => {
    const getForm = () => document.querySelector(formSelector);

    const initialize = ({ data = null, isDisabled = false } = {}) => {
        selects.init();
        selects.setOptions(data);

        const form = getForm();

        fieldNames.forEach(name => toggleDisabledElement({
            element: form.elements[name],
            isDisabled
        }));

        selects.syncState();
    };

    const readData = () => {
        const form = getForm();

        return Object.fromEntries(
            fieldNames.map(name => [name, form.elements[name].value])
        );
    };

    return {
        initialize,
        readData
    };
};

export const useIssueForm = ({
    selector,
    normalizeData,
    getErrors,
    register,
    edit,
    editDetails,
    editHeader,
    onSaved = async () => {}
}) => useForm({
    selector,
    normalizeData,
    getErrors,
    sendRequest: async ({ form, formData }) => {
        await handleSubmit({
            form,
            formData,
            create: register,
            update: {
                [FORM_MODES.EDIT_DETAIL]: editDetails,
                [FORM_MODES.EDIT_HEADER]: editHeader
            }[form.dataset.mode] ?? edit
        });

        await onSaved();
    }
});
