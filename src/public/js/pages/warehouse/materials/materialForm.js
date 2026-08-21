import { useForm } from "../../../ui/forms/formUI.js";
import { editMaterial, editMaterialStock, registerMaterial } from "../../../application/warehouse/materials/materials.js";
import { FORM_SELECTORS, MODAL_SELECTORS } from "../../../constants/selectors.js";

import { handleSubmit, pickFormFields, validateFields } from "../../../utils/formUtils.js";
import { goodsReceiptMaterialCreateValidation, materialCreateValidation, materialEditValidation, materialStockValidation } from "../../../utils/validations/validators.js";
import { materialCreateFields, materialSecondaryDataFields, materialStockFields } from './materialFields.js';
import { isEditMode, isStockMode } from '../../../constants/formModes.js';

const formId = FORM_SELECTORS.MATERIAL;
const materialModalId = MODAL_SELECTORS.MATERIAL;
const goodsReceiptCreationContext = 'goodsReceipt';

const getCreationContext = (form) => form.dataset.creationContext || null;
const isGoodsReceiptCreation = (form) => getCreationContext(form) === goodsReceiptCreationContext;

const getMaterialValidation = (form) => {

    if (isEditMode(form.dataset.mode)) return materialEditValidation;
    if (!isGoodsReceiptCreation(form)) return materialCreateValidation;

    return goodsReceiptMaterialCreateValidation;
};

useForm({
    selector: formId,
    normalizeData: ({ form, formData }) => {

        const fields = isStockMode(form.dataset.mode)
            ? materialStockFields
            : isEditMode(form.dataset.mode) ? materialSecondaryDataFields : materialCreateFields;

        if (isStockMode(form.dataset.mode)) {
            formData.supplierId = document.querySelector(`${ materialModalId } select[name='supplierId']`).value;
        }

        if (isEditMode(form.dataset.mode)) {
            formData.supplierId = document.querySelector(`${ materialModalId } select[name='supplierId']`).value;
        }

        if (!isStockMode(form.dataset.mode)) {

            if (!formData.minStock) delete formData.minStock;
            
            formData.isActive = document.querySelector(`${ formId } #isActiveInput`).checked;
        }

        return pickFormFields(formData, fields);
    },
    getErrors: ({ form, formData }) => {

        if (isStockMode(form.dataset.mode)) return validateFields(materialStockValidation, formData);

        return validateFields(getMaterialValidation(form), formData);
    },
    sendRequest: async ({ formData, form }) => {

        const material = await handleSubmit({
            form,
            formData,
            create: ({ formData }) => registerMaterial({ formData, creationContext: getCreationContext(form) }),
            update: isStockMode(form.dataset.mode) ? editMaterialStock : editMaterial
        });

        form.onSave?.(material);
    },
});
