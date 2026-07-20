import { useForm } from '../../../application/form.js';
import { returnGoodsIssueDetail } from '../../../application/warehouse/goodsIssues/goodsIssues.js';
import { initMdbModal } from '../../../plugins/mdb/baseInstance.js';
import { notifications } from '../../../plugins/swal/swalComponent.js';
import { resetFormSubmitState } from '../../../ui/formUI.js';
import { validateFields } from '../../../utils/formUtils.js';
import { validateGoodsIssueReturnValidators } from '../../../utils/validations/validators.js';

const RETURN_MODAL_SELECTOR = '#goodsIssueReturnModal';
const RETURN_FORM_SELECTOR = '#goodsIssueReturnForm';
export const GOODS_ISSUE_RETURN_APPLIED_EVENT = 'goods-issue-return:applied';

const getModal = () => document.querySelector(RETURN_MODAL_SELECTOR);

export const initGoodsIssueReturnForm = () => {
    useForm({
        selector: RETURN_FORM_SELECTOR,
        normalizeData: ({ formData }) => ({
            ...formData,
            returnQuantity: Number(formData.returnQuantity)
        }),
        getErrors: ({ form, formData }) => {
            const errors = validateFields(validateGoodsIssueReturnValidators, formData);
            const availableQuantity = Number(form.dataset.availableQuantity || 0);

            if (!errors.returnQuantity && formData.returnQuantity > availableQuantity) {
                errors.returnQuantity = 'La cantidad no puede exceder lo disponible para devolver.';
            }

            return errors;
        },
        sendRequest: async ({ formData, form }) => {
            if (!form.dataset.id || !form.dataset.detailId) {
                notifications.showError('No hay detalle seleccionado para devolver.');
                resetFormSubmitState(form);
                return;
            }

            const response = await returnGoodsIssueDetail({
                id: form.dataset.id,
                detailId: form.dataset.detailId,
                formData: {
                    returnQuantity: formData.returnQuantity,
                    observations: formData.observations
                }
            });

            notifications.showSuccess(response.message);
            getModal().dispatchEvent(new CustomEvent(GOODS_ISSUE_RETURN_APPLIED_EVENT, {
                bubbles: true,
                detail: {
                    returnQuantity: formData.returnQuantity,
                    goodsIssueReturn: response.data
                }
            }));
            initMdbModal(getModal()).hide();
        }
    });
};
