import { useForm } from '../../../ui/forms/formUI.js';
import { initializeInventoryCrudModal } from '../../../ui/inventory/inventoryCrudModalUI.js';
import { setFormDisabled } from '../../../ui/forms/formStateUI.js';
import { openModal, closeModal } from '../../../ui/modalUI.js';
import { BUTTON_SELECTORS } from '../../../constants/selectors.js';
import { getWasteRollReference, saveWasteRollReference } from '../../../application/warehouse/wastes/wastes.js';
import { getRollReferenceValidationError } from '../../../utils/wasteRollUtils.js';
import { calculateWasteNetWeight } from '../../../utils/warehouseInventoryUtils.js';
import { updateWasteRollMeasurement } from '../../../ui/inventory/inventorySelectUI.js';
import { getErrorMessage } from '../../../constants/apiMessages.js';
import { notifications } from '../../../plugins/swal/swalComponent.js';
import { setMdbWrapperInputValue } from '../../../plugins/mdb/baseInstance.js';
import { hasPermission, UI_PERMISSIONS } from '../../../constants/permissions.js';

const parent = document.querySelector('#wasteForm');
const form = document.querySelector('#wasteRollReferenceForm');
const button = parent.querySelector('#wasteRollReferenceButton');
const fields = ['coneWeightMode', 'referenceConeWeightKg', 'referenceRollTotalWeightKg'];
const updateNet = () => {
    const weight = calculateWasteNetWeight({ coneWeightKg: form.elements.referenceConeWeightKg.value, totalWeightKg: form.elements.referenceRollTotalWeightKg.value });
    setMdbWrapperInputValue({ selector: '#referenceRollNetWeightKgInput', value: weight > 0 ? weight : '' });
};

button.addEventListener('click', async () => {
    if (!hasPermission(window.meta || {}, UI_PERMISSIONS.MATERIALS_WRITE)) return;
    const materialId = parent.elements.materialId.value;
    const supplierId = parent.elements.supplierId.value;
    if (!materialId || !supplierId) return;
    try {
        const response = await getWasteRollReference({ materialId, supplierId });
        const reference = response.data.reference;
        initializeInventoryCrudModal({ form, mode: 'edit' });
        form.querySelector(BUTTON_SELECTORS.SUBMIT).textContent = 'Guardar';
        setFormDisabled({ form, fields: ['referenceRollNetWeightKg'], isDisabled: true });
        document.querySelector('#wasteRollReferenceModal .modal-title').textContent = 'Referencia del rollo';
        form.dataset.materialId = materialId;
        form.dataset.supplierId = supplierId;
        fields.forEach(name => { form.elements[name].value = reference[name] ?? ''; });
        document.querySelector('#rollReferenceLengthInfo').textContent = 'Longitud del material: ' + reference.referenceLengthM + ' m; ancho: ' + reference.referenceWidthM + ' m';
        updateNet();
        openModal(document.querySelector('#wasteRollReferenceModal'));
    } catch (err) { notifications.showError(err.message); }
});

form.addEventListener('input', updateNet);
useForm({
    selector: '#wasteRollReferenceForm',
    normalizeData: ({ formData }) => Object.fromEntries([
        ['materialId', form.dataset.materialId], ['supplierId', form.dataset.supplierId],
        ...fields.map(name => [name, formData[name]])
    ]),
    getErrors: ({ formData }) => Object.fromEntries(fields.map(name => {
        const code = getRollReferenceValidationError(formData[name], formData, name);
        return [name, code ? getErrorMessage({ code }) : null];
    })),
    sendRequest: async ({ formData }) => {
        const result = await saveWasteRollReference({ formData });
        parent.dataset.rollReference = JSON.stringify(result.data);
        delete parent.dataset.duplicateWaste;
        parent.querySelector('#wasteDuplicateStockButton').classList.add('d-none');
        if (!parent.elements.coneWeightKg.value && result.data.coneWeightMode === 'FIXED') parent.elements.useConeReference.checked = true;
        updateWasteRollMeasurement({ form: parent });
        notifications.showSuccess(result.message);
        closeModal(form);
    }
});
