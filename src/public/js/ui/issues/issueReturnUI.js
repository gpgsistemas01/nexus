import { useForm } from '../forms/formUI.js';
import { initMdbModal, initMdbWrapperInput, updateMdbWrapperInput } from '../../plugins/mdb/baseInstance.js';
import { notifications } from '../../plugins/swal/swalComponent.js';
import { clearFormErrors } from '../forms/formErrorsUI.js';
import { resetFormSubmitState } from '../forms/formStateUI.js';
import { setSummaryValue } from '../forms/totalsSummaryUI.js';
import { formatDecimal, roundTo } from '../../utils/formatUtils.js';
import { validateFields } from '../../utils/formUtils.js';
import { issueReturnValidation } from '../../utils/validations/validators.js';
import { openModal } from '../modalUI.js';

export const createIssueReturn = ({ sendReturn }) => {
    const modalSelector = '#issueReturnModal';
    const formSelector = '#issueReturnForm';
    const getModal = () => document.querySelector(modalSelector);
    const initialize = () => useForm({
        selector: formSelector,
        normalizeData: ({ formData }) => ({ ...formData, returnQuantity: Number(formData.returnQuantity) }),
        getErrors: ({ form, formData }) => {
            const errors = validateFields(issueReturnValidation, formData);
            const available = Number(form.dataset.availableQuantity || 0);

            if (!errors.returnQuantity && formData.returnQuantity > available) {
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

            const response = await sendReturn({
                id: form.dataset.id,
                detailId: form.dataset.detailId,
                formData
            });

            notifications.showSuccess(response.message);
            initMdbModal(getModal()).hide();
            window.location.reload();
        }
    });

    const open = ({ issue, detail }) => {
        const form = document.querySelector(formSelector);
        const supplied = Number(detail.suppliedQuantity ?? 0);
        const returned = Number(detail.returnedQuantity ?? 0);
        // Keep calculation precision aligned with persistence; formatDecimal rounds only
        // the read-only summaries shown to the user.
        const available = roundTo(supplied - returned);

        setSummaryValue({ selector: '#issueReturnSuppliedQuantity', value: supplied, formatter: formatDecimal });
        setSummaryValue({ selector: '#issueReturnReturnedQuantity', value: returned, formatter: formatDecimal });
        setSummaryValue({ selector: '#issueReturnAvailableQuantity', value: available, formatter: formatDecimal });
        document.querySelector('#issueReturnMaterialValue').textContent = detail.name;
        form.reset();
        clearFormErrors(form);
        resetFormSubmitState(form);
        form.dataset.id = issue.id;
        form.dataset.detailId = detail.id;
        form.dataset.availableQuantity = String(available);
        updateMdbWrapperInput(initMdbWrapperInput({ selector: '#issueReturnQuantityInput', value: '' }));
        updateMdbWrapperInput(initMdbWrapperInput({ selector: '#issueReturnObservationsInput', value: '' }));
        openModal(getModal());
    };

    return { initialize, open };
};
