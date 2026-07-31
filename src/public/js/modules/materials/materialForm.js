import { useForm } from "../../application/form.js";
import { editMaterial, editMaterialStock, registerMaterial } from "../../application/warehouse/materials.js";
import { FORM_SELECTORS, MODAL_SELECTORS } from "../../constants/selectors.js";

import { handleSubmit, validateFields } from "../../utils/formUtils.js";
import { materialStockValidators, materialValidators } from "../../utils/validations/validators.js";

const formId = FORM_SELECTORS.MATERIAL_FORM;
const materialModalId = MODAL_SELECTORS.MATERIAL;
const stockMode = 'edit-stock';
const goodsReceiptCreationContext = 'goodsReceipt';

const isStockMode = (form) => form.dataset.mode === stockMode;
const getCreationContext = (form) => form.dataset.creationContext || null;
const isGoodsReceiptCreation = (form) => getCreationContext(form) === goodsReceiptCreationContext;

const getMaterialValidators = (form) => {

    if (!isGoodsReceiptCreation(form)) return materialValidators;

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

        if (isStockMode(form)) {
            formData.supplierId = document.querySelector(`${ materialModalId } select[name='supplierId']`).value;
        }

        if (!isStockMode(form)) {
            formData.isActive = document.querySelector(`${ formId } #isActiveInput`).checked;
        }

        return formData;
    },
    getErrors: ({ form, formData }) => {

        if (isStockMode(form)) return validateFields(materialStockValidators, formData);

        return validateFields(getMaterialValidators(form), formData);
    },
    sendRequest: async ({ formData, form }) => {

        const material = await handleSubmit({
            form,
            formData,
            create: ({ formData }) => registerMaterial({ formData, creationContext: getCreationContext(form) }),
            update: isStockMode(form) ? editMaterialStock : editMaterial
        });

        form.onSave?.(material);
    },
});
