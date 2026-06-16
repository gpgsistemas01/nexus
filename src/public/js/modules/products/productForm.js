import { useForm } from "../../application/form.js";
import { editProduct, editProductStock, registerProduct } from "../../application/warehouse/products.js";
import { FORM_SELECTORS, MODAL_SELECTORS } from "../../constants/selectors.js";

import { handleSubmit, validateFields } from "../../utils/formUtils.js";
import { productStockValidators, productValidators } from "../../utils/validations/validators.js";

const formId = FORM_SELECTORS.PRODUCT_FORM;
const productModalId = MODAL_SELECTORS.PRODUCT;
const stockMode = 'edit-stock';
const goodsReceiptCreationContext = 'goodsReceipt';

const isStockMode = (form) => form.dataset.mode === stockMode;
const includesStockAdjustmentOnCreate = (form) => form.dataset.includeStockAdjustmentOnCreate === 'true';
const shouldValidateStockFields = (form) => isStockMode(form) || includesStockAdjustmentOnCreate(form);
const getCreationContext = (form) => form.dataset.creationContext || null;
const isGoodsReceiptCreation = (form) => getCreationContext(form) === goodsReceiptCreationContext;

const getProductValidators = (form) => {

    if (!isGoodsReceiptCreation(form)) return productValidators;

    return {
        ...productValidators,
        maxUnitCost: (value) => value
            ? productValidators.maxUnitCost(value)
            : null
    };
};

useForm({
    selector: formId,
    normalizeData: ({ form, formData }) => {

        if (shouldValidateStockFields(form)) {
            formData.supplierId = document.querySelector(`${ productModalId } select[name='supplierId']`).value;
        }

        if (!isStockMode(form)) {
            formData.isActive = document.querySelector(`${ formId } #isActiveInput`).checked;
        }
        
        return formData;
    },
    getErrors: ({ form, formData }) => {

        if (isStockMode(form)) return validateFields(productStockValidators, formData);

        const errors = validateFields(getProductValidators(form), formData);

        if (!includesStockAdjustmentOnCreate(form)) return errors;

        return {
            ...errors,
            ...validateFields(productStockValidators, formData)
        };
    },
    sendRequest: async ({ formData, form }) => {

        const product = await handleSubmit({
            form,
            formData,
            create: ({ formData }) => registerProduct({
                formData,
                withInitialStockAdjustment: includesStockAdjustmentOnCreate(form),
                creationContext: getCreationContext(form)
            }),
            update: isStockMode(form) ? editProductStock : editProduct
        });

        form.onSave?.(product);
    },
});
