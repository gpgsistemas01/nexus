import { useForm } from "../../application/form.js";
import { editMaterial, editMaterialStock, registerMaterial } from "../../application/warehouse/materials.js";
import { FORM_SELECTORS, MODAL_SELECTORS } from "../../constants/selectors.js";

import { handleSubmit, pickFormFields, validateFields } from "../../utils/formUtils.js";
import { materialStockValidators, materialValidators } from "../../utils/validations/validators.js";
import { materialCreateFields, materialSecondaryDataFields, materialStockFields } from './materialFields.js';
import { isEditMode, isStockMode } from '../../constants/formModes.js';

const formId = FORM_SELECTORS.MATERIAL_FORM;
const materialModalId = MODAL_SELECTORS.MATERIAL;
const goodsReceiptCreationContext = 'goodsReceipt';

const getCreationContext = (form) => form.dataset.creationContext || null;
const isGoodsReceiptCreation = (form) => getCreationContext(form) === goodsReceiptCreationContext;

const materialEditValidators = {
    name: materialValidators.name,
    supplierId: materialValidators.supplierId,
    minStock: materialValidators.minStock,
    maxUnitCost: materialValidators.maxUnitCost
};

const materialCreateValidators = {
    ...materialValidators,
    newStock: materialStockValidators.newStock,
    observations: materialStockValidators.observations
};

const getMaterialValidators = (form) => {

    if (isEditMode(form.dataset.mode)) return materialEditValidators;
    if (!isGoodsReceiptCreation(form)) return materialCreateValidators;

    return {
        ...materialValidators,
        maxUnitCost: (value) => value
            ? materialValidators.maxUnitCost(value)
            : null
    };
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

        if (isStockMode(form.dataset.mode)) return validateFields(materialStockValidators, formData);

        return validateFields(getMaterialValidators(form), formData);
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
