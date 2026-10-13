import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
    config: null, submit: vi.fn(), confirmation: vi.fn(), permission: vi.fn(),
    open: vi.fn(), close: vi.fn(), reset: vi.fn()
}));
const root = '../../../../../../../src/public/js/';
vi.mock('../../../../../../../src/public/js/ui/forms/formUI.js', () => ({ useForm: config => { state.config = config; } }));
vi.mock('../../../../../../../src/public/js/utils/formUtils.js', () => ({ handleSubmit: state.submit, pickFormFields: vi.fn(), validateFields: vi.fn() }));
vi.mock('../../../../../../../src/public/js/plugins/swal/swalComponent.js', () => ({ notifications: { showConfirmation: state.confirmation } }));
vi.mock('../../../../../../../src/public/js/constants/permissions.js', () => ({ hasPermission: state.permission, UI_PERMISSIONS: { WASTES_ADD_STOCK: 'wastes:add-stock' } }));
vi.mock('../../../../../../../src/public/js/pages/warehouse/wastes/wasteStockAdditionModal.js', () => ({ openWasteStockAdditionModal: state.open }));
vi.mock('../../../../../../../src/public/js/ui/modalUI.js', () => ({ closeModal: state.close }));
vi.mock('../../../../../../../src/public/js/ui/forms/formStateUI.js', () => ({ resetFormSubmitState: state.reset }));
vi.mock('../../../../../../../src/public/js/ui/inventory/inventorySelectUI.js', () => ({ updateWasteRollMeasurement: vi.fn() }));
vi.mock('../../../../../../../src/public/js/application/warehouse/wastes/wastes.js', () => ({ registerWaste: vi.fn(), editWaste: vi.fn(), editWasteStock: vi.fn() }));

const form = { dataset: { mode: 'create' }, addEventListener: vi.fn() };
const additionForm = { elements: { quantity: { value: '', dispatchEvent: vi.fn() }, observations: { value: '' } } };
vi.stubGlobal('document', { querySelector: selector => selector === '#wasteForm' ? form : additionForm });
vi.stubGlobal('window', { meta: {} });
await import(`${root}pages/warehouse/wastes/wasteForm.js`);

beforeEach(() => {
    vi.clearAllMocks();
    state.permission.mockReturnValue(true);
    additionForm.elements.quantity.value = '';
    additionForm.elements.observations.value = '';
});

describe('confirmación de merma existente', () => {
    const waste = { id: 'existing-waste' };
    const duplicate = { data: { code: 'WASTE_ALREADY_EXISTS', meta: { waste } } };
    const formData = { newStock: '3', observations: 'Nueva entrada' };

    it('reutiliza el formulario de agregar stock sólo después de confirmar', async () => {
        state.submit.mockRejectedValue(duplicate);
        state.confirmation.mockResolvedValue({ isConfirmed: true });
        await state.config.sendRequest({ form, formData });
        expect(state.reset).toHaveBeenCalledWith(form);
        expect(state.close).toHaveBeenCalledWith(form);
        expect(state.open).toHaveBeenCalledWith({ data: waste });
        expect(additionForm.elements.quantity.value).toBe('3');
        expect(additionForm.elements.observations.value).toBe('Nueva entrada');
        expect(additionForm.elements.quantity.dispatchEvent).toHaveBeenCalledOnce();
        expect(state.submit).toHaveBeenCalledOnce();
    });

    it('al cancelar conserva el formulario y no modifica existencias', async () => {
        state.submit.mockRejectedValue(duplicate);
        state.confirmation.mockResolvedValue({ isConfirmed: false });
        await state.config.sendRequest({ form, formData });
        expect(state.open).not.toHaveBeenCalled();
        expect(state.close).not.toHaveBeenCalled();
        expect(state.reset).toHaveBeenCalledWith(form);
    });

    it('sin permiso mantiene el manejo compartido del error', async () => {
        state.permission.mockReturnValue(false);
        state.submit.mockRejectedValue(duplicate);
        await expect(state.config.sendRequest({ form, formData })).rejects.toBe(duplicate);
        expect(state.confirmation).not.toHaveBeenCalled();
    });
});
