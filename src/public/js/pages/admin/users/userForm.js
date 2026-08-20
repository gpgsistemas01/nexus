import { editUser, editUserPassword, registerUser } from '../../../application/admin/users/users.js';
import { useForm } from '../../../application/form.js';
import { FORM_MODES } from '../../../constants/formModes.js';
import { FORM_SELECTORS } from '../../../constants/selectors.js';
import { handleSubmit, validateFields } from '../../../utils/formUtils.js';
import { userEditValidation, userPasswordValidation, userValidation } from '../../../utils/validations/validators.js';

const formId = FORM_SELECTORS.USER;

useForm({
    selector: formId,
    normalizeData: ({ formData, form }) => {

        const normalizedData = {
            ...formData,
            name: formData.name?.trim(),
        };

        if (form.dataset.mode === FORM_MODES.EDIT_PASSWORD) return {
            password: formData.password
        };

        if (form.dataset.mode === FORM_MODES.EDIT) delete normalizedData.password;

        return normalizedData;
    },
    getErrors: ({ form, formData }) => {

        if (form.dataset.mode === FORM_MODES.EDIT_PASSWORD) return validateFields(userPasswordValidation, formData);

        if (form.dataset.mode === FORM_MODES.EDIT) return validateFields(userEditValidation, formData);

        return validateFields(userValidation, formData);
    },
    sendRequest: async ({ formData, form }) => {

        if (form.dataset.mode === FORM_MODES.EDIT_PASSWORD) return handleSubmit({
            form,
            formData,
            update: editUserPassword
        });

        return handleSubmit({
            form,
            formData,
            create: registerUser,
            update: editUser
        });
    }
});
