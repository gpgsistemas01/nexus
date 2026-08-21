import { useForm } from '../../../application/form.js';
import { editGoodsReceiptHeader, registerGoodsReceipt } from '../../../application/warehouse/goodsReceipts/goodsReceipts.js';
import { DOM_EVENT_NAMES } from '../../../constants/events.js';
import { FORM_MODES } from '../../../constants/formModes.js';
import { BUTTON_SELECTORS, FORM_SELECTORS, INPUT_SELECTORS, MODAL_SELECTORS, SELECT_SELECTORS } from '../../../constants/selectors.js';
import { refreshMaterialTable } from '../../../plugins/datatable/shared/inventory/renderMaterialDatatable.js';
import { GOODS_RECEIPT_SUPPLIER_CHANGED_EVENT } from '../../../plugins/select2/modules/goodsReceiptSelect.js';
import { clearAddedMaterialInput } from '../../../ui/forms/detailFormUI.js';
import { normalizeFormErrors } from '../../../ui/forms/formErrorsUI.js';
import { updateTotals } from '../../../ui/forms/totalsSummaryUI.js';
import { upsertDetail } from '../../../utils/detailCollectionUtils.js';
import { on } from '../../../utils/domUtils.js';
import { handleSubmit, hasValidationErrors, validateFields } from '../../../utils/formUtils.js';
import { addGoodsReceiptMaterialValidation, goodsReceiptEditValidation, goodsReceiptValidation } from '../../../utils/validations/validators.js';
import { mapGoodsReceiptSelectionToDetail } from './goodsReceiptDetails.js';
import { details } from '../../../plugins/datatable/warehouse/goodsReceipts/goodsReceiptDatatable.js';

const modalId = MODAL_SELECTORS.GOODS_RECEIPT;
const formId = FORM_SELECTORS.GOODS_RECEIPT;

const normalizeGoodsReceiptData = ({ form, formData }) => {
    const { mode } = form.dataset;

    formData.isInvoiced = document.querySelector('input[name="isInvoiced"]').checked;

    if (!formData.isInvoiced) delete formData.invoice;

    if (mode === FORM_MODES.EDIT) {
        const { supplierId, ...editableFormData } = formData;
        const newDetails = details.filter(detail => !detail.id);

        return {
            ...editableFormData,
            details: newDetails
        };
    }

    return {
        ...formData,
        details
    };
};

useForm({
    selector: formId,
    normalizeData: normalizeGoodsReceiptData,
    getErrors: ({ form, formData }) => {
        const validators = form.dataset.mode === FORM_MODES.EDIT
            ? goodsReceiptEditValidation
            : goodsReceiptValidation;

        return validateFields(validators, formData);
    },
    sendRequest: async ({ formData, form }) => {
        await handleSubmit({
            form,
            formData,
            create: registerGoodsReceipt,
            update: editGoodsReceiptHeader
        });
    }
});

document.querySelector(modalId).addEventListener(GOODS_RECEIPT_SUPPLIER_CHANGED_EVENT, () => {
    details.length = 0;
    refreshMaterialTable(details);
    clearAddedMaterialInput();
});

const addGoodsReceiptMaterial = () => {

    const option = document.querySelector(`${ SELECT_SELECTORS.MATERIAL } option:checked`);
    if (!option) return;

    const { material, supplier } = option.dataset;
    const selectedMaterial = material ? JSON.parse(material) : {};
    const materialId = selectedMaterial.id;

    const quantity = Number(document.querySelector(INPUT_SELECTORS.QUANTITY).value);
    const costPerUnitType = Number(document.querySelector(INPUT_SELECTORS.COST_PER_UNIT).value);
    const errors = validateFields(addGoodsReceiptMaterialValidation, {
        materialId,
        quantity,
        costPerUnitType
    });

    normalizeFormErrors({ form: document.querySelector(formId), errors });

    if (hasValidationErrors(errors)) return;

    const newDetail = mapGoodsReceiptSelectionToDetail({
        optionData: { material, supplier },
        quantity,
        costPerUnitType
    });
    const previousDetail = upsertDetail({
        details,
        detail: newDetail,
        matches: detail => detail.materialId === materialId
    });

    if (previousDetail) {
        updateTotals({
            quantity: previousDetail.quantity,
            net: previousDetail.netPurchaseAmount,
            gross: previousDetail.grossPurchaseAmount,
            operation: 'subtract'
        });
    }

    refreshMaterialTable(details);
    clearAddedMaterialInput();

    updateTotals({
        quantity,
        net: newDetail.netPurchaseAmount,
        gross: newDetail.grossPurchaseAmount,
        operation: 'add'
    });
};

on(DOM_EVENT_NAMES.CLICK, BUTTON_SELECTORS.ADD_MATERIAL, addGoodsReceiptMaterial);
