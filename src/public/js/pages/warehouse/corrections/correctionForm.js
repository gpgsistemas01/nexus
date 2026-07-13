import { useForm } from "../../../application/form.js";
import { correctGoodsReceiptDetail } from "../../../application/warehouse/goodsReceipts.js";
import { initMdbModal } from "../../../plugins/mdb/baseInstance.js";
import { reloadMainTable } from "../../../plugins/datatable/baseDatatable.js";
import { notifications } from "../../../plugins/swal/swalComponent.js";
import { resetFormSubmitState } from "../../../ui/formUI.js";
import { validateFields } from "../../../utils/formUtils.js";
import { validateGoodsReceiptCorrectionValidators } from "../../../utils/validations/validators.js";

const CORRECTION_MODAL_SELECTOR = '#goodsReceiptCorrectionModal';
const CORRECTION_FORM_SELECTOR = '#goodsReceiptCorrectionForm';
export const GOODS_RECEIPT_CORRECTION_APPLIED_EVENT = 'goods-receipt-correction:applied';

const getModal = () => document.querySelector(CORRECTION_MODAL_SELECTOR);

export const initGoodsReceiptCorrectionForm = () => {
    useForm({
        selector: CORRECTION_FORM_SELECTOR,
        getErrors: ({ formData }) => validateFields(validateGoodsReceiptCorrectionValidators, formData),
        sendRequest: async ({ formData, form }) => {
            const currentDetail = form.correctionDetail;
            const hasChanges = currentDetail && (
                currentDetail.productId !== formData.productId
                || Number(currentDetail.quantity) !== Number(formData.quantity)
                || Number(currentDetail.costPerUnitType) !== Number(formData.costPerUnitType)
            );

            if (!hasChanges) {
                notifications.showWarning('Debe modificar el producto, stock o costo para corregir el detalle.');
                resetFormSubmitState(form);
                return;
            }

            const confirmation = await notifications.showConfirmation({
                title: '¿Corregir detalle de compra?',
                text: 'Se actualizará únicamente el detalle seleccionado, se recalcularán los totales de la compra y se generarán ajustes de inventario para conservar la trazabilidad.',
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
                    productId: formData.productId,
                    quantity: formData.quantity,
                    costPerUnitType: formData.costPerUnitType,
                    reasonId: formData.reasonId,
                    observations: formData.observations
                }
            });

            notifications.showSuccess(response.message);
            getModal().dispatchEvent(new CustomEvent(GOODS_RECEIPT_CORRECTION_APPLIED_EVENT, {
                detail: response.data
            }));
            initMdbModal(getModal()).hide();
            reloadMainTable();
        }
    });
};
