import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
    config: null, submit: vi.fn(), confirmation: vi.fn(), permission: vi.fn(),
    close: vi.fn(), reset: vi.fn(), openAddition: vi.fn(), add: vi.fn(), success: vi.fn(), reload: vi.fn(), validate: vi.fn()
}));
vi.mock('../../../../../../../src/public/js/ui/forms/formUI.js', () => ({ useForm: config => { state.config = config; } }));
vi.mock('../../../../../../../src/public/js/utils/formUtils.js', () => ({
    handleSubmit: state.submit,
    pickFormFields: (data, fields) => Object.fromEntries(fields.filter(field => field in data).map(field => [field, data[field]])),
    validateFields: state.validate
}));
vi.mock('../../../../../../../src/public/js/plugins/swal/swalComponent.js', () => ({ notifications: { showConfirmation: state.confirmation, showSuccess: state.success } }));
vi.mock('../../../../../../../src/public/js/pages/warehouse/wastes/wasteStockAdditionModal.js', () => ({ openWasteStockAdditionModal: state.openAddition }));
vi.mock('../../../../../../../src/public/js/constants/permissions.js', () => ({ hasPermission: state.permission, UI_PERMISSIONS: { WASTES_ADD_STOCK: 'wastes:add-stock' } }));
vi.mock('../../../../../../../src/public/js/ui/modalUI.js', () => ({ closeModal: state.close }));
vi.mock('../../../../../../../src/public/js/ui/forms/formStateUI.js', () => ({ resetFormSubmitState: state.reset }));
vi.mock('../../../../../../../src/public/js/ui/inventory/wasteFormUI.js', () => ({ updateWasteRollMeasurement: vi.fn() }));
vi.mock('../../../../../../../src/public/js/application/warehouse/wastes/wastes.js', () => ({ registerWaste: vi.fn(), editWaste: vi.fn(), editWasteStock: vi.fn(), addWasteStock: state.add }));
vi.mock('../../../../../../../src/public/js/plugins/datatable/core/base/tableOperations.js', () => ({ reloadMainTable: state.reload }));

const form = { dataset: { mode: 'create' }, addEventListener: vi.fn() };
vi.stubGlobal('document', { querySelector: selector => selector === '#wasteForm' ? form : { checked: true } });
vi.stubGlobal('window', { meta: {} });
await import('../../../../../../../src/public/js/pages/warehouse/wastes/wasteForm.js');

beforeEach(() => {
    vi.clearAllMocks();
    form.dataset.mode = 'create';
    form.wasteMaterialTemplate = null;
    form.elements = { base: { value: '' }, height: { value: '' } };
    state.permission.mockReturnValue(true);
});

describe('confirmación de merma existente', () => {
    const waste = { id: 'existing-waste', name: 'Lona' };
    const duplicate = { data: { code: 'WASTE_ALREADY_EXISTS', meta: { waste } } };
    const formData = { newStock: '3', observations: 'Nueva entrada' };

    it('confirma y abre el modal existente con la captura sin registrar stock', async () => {
        state.submit.mockRejectedValue(duplicate);
        state.confirmation.mockImplementation(async () => {
            expect(state.reset).not.toHaveBeenCalled();
            return { isConfirmed: true };
        });
        await state.config.sendRequest({ form, formData });
        expect(state.confirmation).toHaveBeenCalledWith(expect.objectContaining({ confirmButtonText: 'Abrir Agregar stock' }));
        expect(state.close).toHaveBeenCalledExactlyOnceWith(form);
        expect(state.openAddition).toHaveBeenCalledExactlyOnceWith({ data: waste, quantity: '3', observations: 'Nueva entrada' });
        expect(state.close.mock.invocationCallOrder[0]).toBeLessThan(state.openAddition.mock.invocationCallOrder[0]);
        expect(state.add).not.toHaveBeenCalled();
        expect(state.success).not.toHaveBeenCalled();
        expect(state.reload).not.toHaveBeenCalled();
    });

    it('al cancelar conserva el formulario y no modifica existencias', async () => {
        state.submit.mockRejectedValue(duplicate);
        state.confirmation.mockResolvedValue({ isConfirmed: false });
        await state.config.sendRequest({ form, formData });
        expect(state.add).not.toHaveBeenCalled();
        expect(state.close).not.toHaveBeenCalled();
        expect(state.openAddition).not.toHaveBeenCalled();
        expect(state.reset).toHaveBeenCalledExactlyOnceWith(form);
    });

    it('con cantidad cero permite abrir el modal para capturar una cantidad positiva', async () => {
        state.submit.mockRejectedValue(duplicate);
        state.confirmation.mockResolvedValue({ isConfirmed: true });
        await state.config.sendRequest({ form, formData: { ...formData, newStock: '0' } });
        expect(state.openAddition).toHaveBeenCalledExactlyOnceWith({ data: waste, quantity: '0', observations: 'Nueva entrada' });
        expect(state.add).not.toHaveBeenCalled();
    });

    it('sin permiso mantiene el manejo compartido del error', async () => {
        state.submit.mockRejectedValue(duplicate);
        state.permission.mockReturnValue(false);
        await expect(state.config.sendRequest({ form, formData })).rejects.toBe(duplicate);
        expect(state.confirmation).not.toHaveBeenCalled();
        expect(state.openAddition).not.toHaveBeenCalled();
        expect(state.add).not.toHaveBeenCalled();
    });

    it('un conflicto de edición no se convierte en una entrada de stock', async () => {
        state.submit.mockRejectedValue(duplicate);
        form.dataset.mode = 'edit';
        await expect(state.config.sendRequest({ form, formData })).rejects.toBe(duplicate);
        expect(state.confirmation).not.toHaveBeenCalled();
        expect(state.openAddition).not.toHaveBeenCalled();
        expect(state.add).not.toHaveBeenCalled();
    });

    it('no suma existencias sin un registro identificado por el servidor', async () => {
        const conflict = { data: { code: 'WASTE_ALREADY_EXISTS' } };
        state.submit.mockRejectedValue(conflict);
        await expect(state.config.sendRequest({ form, formData })).rejects.toBe(conflict);
        expect(state.confirmation).not.toHaveBeenCalled();
        expect(state.openAddition).not.toHaveBeenCalled();
        expect(state.add).not.toHaveBeenCalled();
    });

    it('incluye las dimensiones finales y excluye el peso calculado y las referencias del payload', () => {
        const payload = state.config.normalizeData({ form, formData: {
            name: 'Lona', base: '1.5', height: '10', newStock: '3', coneWeightKg: '0.25', totalWeightKg: '1.25',
            weightKg: '1', referenceRollTotalWeightKg: '2.25', observations: 'Entrada'
        } });
        expect(payload).toMatchObject({ base: '1.5', height: '10', coneWeightKg: '0.25', totalWeightKg: '1.25' });
        expect(payload).not.toHaveProperty('weightKg');
        expect(payload).not.toHaveProperty('referenceRollTotalWeightKg');
    });

    it('incluye las medidas calculadas del rollo aunque los inputs deshabilitados no estén en FormData', () => {
        form.wasteMaterialTemplate = { presentation: { name: 'ROLLO' } };
        form.elements.base = { value: '1.5', disabled: true };
        form.elements.height = { value: '10', disabled: true };
        const payload = state.config.normalizeData({ form, formData: { name: 'Lona', coneWeightKg: '0.25', totalWeightKg: '1.25' } });
        expect(payload).toMatchObject({ base: '1.5', height: '10', coneWeightKg: '0.25', totalWeightKg: '1.25' });
        expect(form.elements.base.disabled).toBe(true);
        expect(form.elements.height.disabled).toBe(true);
    });
});
