import { registerPerson, updatePerson } from '../../../application/admin/persons/persons.js';
import { useForm } from '../../../ui/forms/formUI.js';
import { personAccesses } from '../../../plugins/datatable/admin/persons/personDatatable.js';
import { FORM_SELECTORS } from '../../../constants/selectors.js';
import { handleSubmit, validateFields } from '../../../utils/formUtils.js';
import { personValidation } from '../../../utils/validations/validators.js';

useForm({
    selector: FORM_SELECTORS.PERSON,
    normalizeData: ({ formData }) => ({
        ...formData,
        accesses: personAccesses.map(({ departmentId, roleId }) => ({ departmentId, roleId }))
    }),
    getErrors: ({ formData }) => validateFields(personValidation, formData),
    sendRequest: async ({ formData, form }) => {
        await handleSubmit({
            form,
            formData,
            create: registerPerson,
            update: updatePerson
        });
    }
});
