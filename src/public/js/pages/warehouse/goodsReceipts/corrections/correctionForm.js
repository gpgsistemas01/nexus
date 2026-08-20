import { FORM_SELECTORS, MODAL_SELECTORS } from '../../../../constants/selectors.js';
import { useForm } from "../../../../application/form.js";
import { correctGoodsReceiptDetail } from "../../../../application/warehouse/goodsReceipts/goodsReceipts.js";
import { initMdbModal } from "../../../../plugins/mdb/baseInstance.js";
import { reloadMainTable } from '../../../../plugins/datatable/core/base/tableOperations.js';
import { notifications } from "../../../../plugins/swal/swalComponent.js";
import { resetFormSubmitState } from "../../../../ui/forms/formStateUI.js";
import { validateFields } from "../../../../utils/formUtils.js";
import { goodsReceiptCorrectionValidation } from "../../../../utils/validations/validators.js";

const CORRECTION_MODAL_SELECTOR = MODAL_SELECTORS.GOODS_RECEIPT_CORRECTION;
const CORRECTION_FORM_SELECTOR = FORM_SELECTORS.GOODS_RECEIPT_CORRECTION;
export const GOODS_RECEIPT_CORRECTION_APPLIED_EVENT = 'goods-receipt-correction:applied';

const getModal = () => document.querySelector(CORRECTION_MODAL_SELECTOR);

export const initGoodsReceiptCorrectionForm = () => {
    useForm({
        selector: CORRECTION_FORM_SELECTOR,
        normalizeData: ({ formData }) => formData,
        getErrors: ({ formData }) => validateFields(goodsReceiptCorrectionValidation, formData),
        sendRequest: async ({ formData, form }) => {
            const currentDetail = form.correctionDetail;
            const hasChanges = currentDetail && (
                Number(currentDetail.quantity) !== Number(formData.quantity)
                || Number(currentDetail.costPerUnitType) !== Number(formData.costPerUnitType)
            );

            if (!hasChanges) {
                notifications.showWarning('Debe modificar la cantidad o el costo para corregir el detalle.');
                resetFormSubmitState(form);
                return;
            }

            const confirmation = await notifications.showConfirmation({
                title: '¿Corregir detalle de compra?',
                text: 'Revisa los nuevos totales estimados en el formulario. Se guardará la corrección y se ajustará inventario automáticamente.',
                confirmButtonText: 'Corregir detalle'
            });

            if (!confirmation.isConfirmed) {
                resetFormSubmitState(form);
                return;
            }

            const response = await correctGoodsReceiptDetail({
                id: form.dataset.id,
                detailId: form.dataset.detailId,
                formData: {
                    quantity: formData.quantity,
                    costPerUnitType: formData.costPerUnitType
                }
            });

            notifications.showSuccess(response.message);
            getModal().dispatchEvent(new CustomEvent(GOODS_RECEIPT_CORRECTION_APPLIED_EVENT, {
                bubbles: true,
                detail: response.data
            }));
            initMdbModal(getModal()).hide();
            reloadMainTable();
        }
    });
};
