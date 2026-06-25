import { useForm } from "../../application/form.js";
import { editProduct, editProductStock, registerProduct } from "../../application/warehouse/products.js";
import { FORM_SELECTORS, MODAL_SELECTORS } from "../../constants/selectors.js";

import { handleSubmit, validateFields } from "../../utils/formUtils.js";
import { productReturnValidators, productStockValidators, productValidators } from "../../utils/validations/validators.js";

const formId = FORM_SELECTORS.PRODUCT_FORM;
const productModalId = MODAL_SELECTORS.PRODUCT;
const stockMode = 'edit-stock';
const returnMode = 'return-product';
const goodsReceiptCreationContext = 'goodsReceipt';

const isStockMode = (form) => form.dataset.mode === stockMode;
const isReturnMode = (form) => form.dataset.mode === returnMode;
const includesStockAdjustmentOnCreate = (form) => form.dataset.includeStockAdjustmentOnCreate === 'true';
const shouldValidateStockFields = (form) => isStockMode(form) || isReturnMode(form) || includesStockAdjustmentOnCreate(form);
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

        if (isReturnMode(form)) return validateFields(productReturnValidators, formData);

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
            update: isStockMode(form) || isReturnMode(form) ? ({ formData, id }) => {

                if (!isReturnMode(form)) return editProductStock({ formData, id });

                return editProductStock({
                    id,
                    formData: {
                        supplierId: formData.supplierId,
                        returnedQuantity: formData.newStock,
                        observations: formData.observations
                    }
                });
            } : editProduct
        });

        form.onSave?.(product);
    },
});
