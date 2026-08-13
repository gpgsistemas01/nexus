import { useForm } from '../../application/form.js';
import { FORM_MODES, ISSUE_HEADER_ENABLED_MODES } from '../../constants/formModes.js';
import { FULFILLMENT_STATUS_NAMES } from '../../constants/fulfillmentStatuses.js';
import { handleSubmit, syncCheckboxControlledInputs, toggleDisabledElement } from '../../utils/formUtils.js';
import { on } from '../../utils/domUtils.js';
import { formatDecimal, roundTo } from '../../utils/formatUtils.js';
import { clearFormErrors, initForm, setFormDisabled, toggleButtons } from '../formUI.js';
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

const resolveIssueUpdate = ({ mode, edit, editDetails, editHeader }) => {
    if (mode === FORM_MODES.EDIT_DETAIL) return editDetails;
    if (mode === FORM_MODES.EDIT_HEADER) return editHeader;

    return edit;
};

const resolveIssueFormMode = ({ status, fulfillmentStatus } = {}) => {
    if (status === 'Cancelada' || fulfillmentStatus === FULFILLMENT_STATUS_NAMES.CANCELED) {
        return FORM_MODES.VIEW;
    }

    return fulfillmentStatus === FULFILLMENT_STATUS_NAMES.PENDING
        ? FORM_MODES.EDIT
        : FORM_MODES.EDIT_HEADER;
};

export const createIssueTableActions = ({ openIssueModal }) => ({
    onCreate: () => openIssueModal({ mode: FORM_MODES.CREATE }),
    onEdit: issue => openIssueModal({
        mode: resolveIssueFormMode({
            status: issue.status?.name,
            fulfillmentStatus: issue.fulfillmentStatus?.name
        }),
        data: issue
    }),
    onEditDetails: issue => openIssueModal({ mode: FORM_MODES.EDIT_DETAIL, data: issue }),
    onReturnDetails: issue => openIssueModal({ mode: FORM_MODES.RETURN, data: issue })
});

export const getPendingIssueSupplyDetails = details => details.filter(
    detail => detail.isSupplied && !detail.originalIsSupplied
);

export const mapIssueSupplyDetails = details => getPendingIssueSupplyDetails(details)
    .map(({ id, isSupplied, projectConvertedQuantity }) => ({
        id,
        isSupplied,
        projectConvertedQuantity
    }));

export const bindIssueProjectQuantityControls = ({
    form,
    tableSelector,
    findDetail
}) => {
    on('change', `${ tableSelector } .supply-checkbox`, (_, checkbox) => {
        const detail = findDetail(checkbox);

        if (!detail) return;

        detail.isSupplied = checkbox.checked;

        if (!checkbox.checked) {
            detail.projectConvertedQuantity = null;
            detail.convertedQuantityDifference = 0;
        }

        syncIssueProjectQuantityInput({ form, checkbox, detail });
    });

    on('input', `${ tableSelector } .project-converted-quantity-input`, (_, input) => {
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

const syncIssueProjectQuantityInput = ({ form, checkbox, detail }) => {
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

    if (differenceCell) differenceCell.textContent = detail.convertedQuantityDifference ?? '';
};

export const initializeIssueModal = ({ form, issueHeaderForm, mode, data = null }) => {
    initForm({ form, mode, id: data?.id || '' });
    form.querySelector('#submitBtn')?.classList.remove('d-none');
    clearFormErrors(form);
    toggleButtons({
        mode,
        status: data?.status?.name,
        showActions: false,
        withTotal: false,
        showAddMaterial: mode === FORM_MODES.CREATE
            || (mode === FORM_MODES.EDIT && data?.fulfillmentStatus?.name === FULFILLMENT_STATUS_NAMES.PENDING)
    });
    setFormDisabled({ form, isDisabled: false });
    issueHeaderForm.initialize({
        data,
        isDisabled: !ISSUE_HEADER_ENABLED_MODES.includes(mode)
    });

    if (data) {
        setFormDisabled({
            form,
            isDisabled: mode !== FORM_MODES.EDIT && mode !== FORM_MODES.EDIT_HEADER
        });
        issueHeaderForm.setDisabled(!ISSUE_HEADER_ENABLED_MODES.includes(mode));
    }
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
    const title = modalElement.querySelector('#modalTitle');
    const submit = form.querySelector('#submitBtn');

    if (mode === FORM_MODES.CREATE) {
        title.textContent = createTitle;
        submit.textContent = 'Guardar';
    } else if (mode === FORM_MODES.EDIT || mode === FORM_MODES.EDIT_HEADER) {
        title.textContent = buildModalTitle({ action: 'Editar', entityName, referenceNumber });
        submit.textContent = 'Editar';
    } else if (mode === FORM_MODES.EDIT_DETAIL) {
        title.textContent = buildModalTitle({ action: detailAction, entityName, referenceNumber });
        submit.textContent = 'Surtir';
    } else if (mode === FORM_MODES.RETURN) {
        title.textContent = buildModalTitle({ action: returnAction, entityName, referenceNumber });
        submit.classList.add('d-none');
    } else if (mode === FORM_MODES.VIEW) {
        title.textContent = buildModalTitle({ action: 'Consultar', entityName, referenceNumber });
        submit.classList.add('d-none');
        setFormDisabled({ form, isDisabled: true });
    }
};

export const createIssueHeaderForm = ({
    formSelector,
    fieldNames = ISSUE_HEADER_FIELD_NAMES,
    selects
}) => {
    const getForm = () => document.querySelector(formSelector);

    const setDisabled = isDisabled => {
        const form = getForm();

        fieldNames.forEach(name => toggleDisabledElement({
            element: form.elements[name],
            isDisabled
        }));

        selects.syncState();
    };

    const initialize = ({ data = null, isDisabled = false } = {}) => {
        selects.init();
        selects.setOptions(data);
        setDisabled(isDisabled);
    };

    const readData = () => {
        const form = getForm();

        return Object.fromEntries(
            fieldNames.map(name => [name, form.elements[name].value])
        );
    };

    return {
        initialize,
        readData,
        setDisabled
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
            update: resolveIssueUpdate({
                mode: form.dataset.mode,
                edit,
                editDetails,
                editHeader
            })
        });

        await onSaved();
    }
});
