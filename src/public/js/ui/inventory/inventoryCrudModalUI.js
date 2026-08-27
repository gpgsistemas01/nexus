import { clearFormErrors } from '../forms/formErrorsUI.js';
import { initForm, setFormDisabled } from '../forms/formStateUI.js';

export const initializeInventoryCrudModal = ({
    form,
    mode,
    data = null,
    isDisabled = false
}) => {
    initForm({ form, mode, id: data?.id || '' });
    clearFormErrors(form);
    setFormDisabled({ form, isDisabled });
};
