import { useForm } from "../../../ui/forms/formUI.js";
import { editMaterial, editMaterialStock, registerMaterial } from "../../../application/warehouse/materials/materials.js";
import { editConsumable, editConsumableStock, registerConsumable } from '../../../application/warehouse/consumables/consumables.js';
import { FORM_SELECTORS } from "../../../constants/selectors.js";

import { handleSubmit, pickFormFields, validateFields } from "../../../utils/formUtils.js";
import { goodsReceiptMaterialCreateValidation, materialCreateValidation, materialEditValidation, materialStockValidation } from "../../../utils/validations/validators.js";
import { materialCreateFields, materialSecondaryDataFields, materialStockRequestFields } from './materialFields.js';
import { isEditMode, isStockMode } from '../../../constants/formModes.js';
import { INVENTORY_RESOURCES } from '../../../constants/inventory.js';

const formId = FORM_SELECTORS.MATERIAL;
const goodsReceiptCreationContext = 'goodsReceipt';

const getCreationContext = (form) => form.dataset.creationContext || null;
const isGoodsReceiptCreation = (form) => getCreationContext(form) === goodsReceiptCreationContext;
const resourceRequests = Object.freeze({
    [INVENTORY_RESOURCES.MATERIAL]: {
        create: registerMaterial,
        edit: editMaterial,
        stock: editMaterialStock
    },
    [INVENTORY_RESOURCES.CONSUMABLE]: {
        create: registerConsumable,
        edit: editConsumable,
        stock: editConsumableStock
    }
});

const getResourceRequests = form => resourceRequests[form.dataset.resource]
    ?? resourceRequests[INVENTORY_RESOURCES.MATERIAL];

const getMaterialValidation = (form) => {

    if (isEditMode(form.dataset.mode)) return materialEditValidation;
    if (!isGoodsReceiptCreation(form)) return materialCreateValidation;

    return goodsReceiptMaterialCreateValidation;
};

useForm({
    selector: formId,
    normalizeData: ({ form, formData }) => {

        const fields = isStockMode(form.dataset.mode)
            ? materialStockRequestFields
            : isEditMode(form.dataset.mode) ? materialSecondaryDataFields : materialCreateFields;

        if (isStockMode(form.dataset.mode) || isEditMode(form.dataset.mode)) {
            formData.supplierId = form.elements.supplierId.value;
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

        const requests = getResourceRequests(form);

        const material = await handleSubmit({
            form,
            formData,
            create: ({ formData }) => requests.create({ formData, creationContext: getCreationContext(form) }),
            update: isStockMode(form.dataset.mode) ? requests.stock : requests.edit
        });

        form.onSave?.(material);
    },
});
