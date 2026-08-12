import { useForm } from '../../application/form.js';
import { FORM_MODES } from '../../constants/formModes.js';
import { handleSubmit, toggleDisabledElement } from '../../utils/formUtils.js';

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
