import {
    editCatalogEntry,
    registerCatalogEntry
} from '../../../application/admin/catalogs/catalogs.js';
import { useForm } from '../../../ui/forms/formUI.js';
import { handleSubmit, validateFields } from '../../../utils/formUtils.js';
import { createCatalogValidation } from '../../../utils/validations/validators.js';

const catalogContext = document.querySelector('#catalogContext');
const entityLabel = catalogContext.dataset.entityLabel;
const nameMaxLength = Number(catalogContext.dataset.nameMaxLength);
const symbolMaxLength = Number(catalogContext.dataset.symbolMaxLength);

const catalogValidation = createCatalogValidation({
    entityLabel,
    nameMaxLength,
    symbolMaxLength
});

useForm({
    selector: '#catalogForm',
    normalizeData: ({ form, formData }) => ({
        ...formData,
        ...(form.elements.isActive.disabled
            ? {}
            : { isActive: form.elements.isActive.checked })
    }),
    getErrors: ({ formData }) => validateFields(catalogValidation, formData),
    sendRequest: ({ formData, form }) => handleSubmit({
        form,
        formData,
        create: request => registerCatalogEntry({ ...request, catalog: form.dataset.catalog }),
        update: request => editCatalogEntry({ ...request, catalog: form.dataset.catalog })
    })
});
