import { describe, expect, it, vi } from 'vitest';
vi.mock('../../../../../../src/public/js/plugins/datatable/core/base/tableOperations.js', () => ({ reloadMainTable: vi.fn() }));
vi.mock('../../../../../../src/public/js/plugins/swal/swalComponent.js', () => ({ notifications: { showSuccess: vi.fn() } }));
vi.mock('../../../../../../src/public/js/ui/modalUI.js', () => ({ closeModal: vi.fn() }));
vi.mock('../../../../../../src/public/js/plugins/flatpickr/dateTimePicker.js', () => ({ setDateTimePickerValue: vi.fn() }));
vi.mock('../../../../../../src/public/js/ui/forms/formErrorsUI.js', () => ({ clearFormErrors: vi.fn() }));
const { mapMaterialRowToFormData } = await import('../../../../../../src/public/js/plugins/datatable/warehouse/materials/materialRow.js');
const { initializeInventoryCrudModal } = await import('../../../../../../src/public/js/ui/inventory/inventoryCrudModalUI.js');
const { handleSubmit } = await import('../../../../../../src/public/js/utils/formUtils.js');
const createForm = () => ({
  dataset: {}, reset: vi.fn(), querySelectorAll: () => [],
  querySelector: () => ({ removeAttribute: vi.fn(), classList: { toggle: vi.fn() } })
});

describe('versiones desde el listado hasta el comando de inventario (DP-CON-002)', () => {
  it('conserva la versión de la oferta aunque el formulario aplane el Material compartido', async () => {
    const data = mapMaterialRowToFormData({ id: 'offer-1', version: 7,
      material: { id: 'material-1', name: 'Lona', version: 3 }, supplier: { id: 'supplier-1' } });
    const form = createForm();
    initializeInventoryCrudModal({ form, mode: 'edit', data });
    const update = vi.fn(async () => ({ message: 'OK' }));
    await handleSubmit({ form, formData: { name: 'Lona revisada' }, update });
    expect(update).toHaveBeenCalledWith({ id: 'material-1', formData: {
      name: 'Lona revisada', expectedVersion: 7, expectedMaterialVersion: 3
    } });
  });

  it('una captura nueva no hereda las versiones de un registro editado antes', async () => {
    const form = createForm();
    initializeInventoryCrudModal({ form, mode: 'edit', data: { id: 'waste-1', version: 9 } });
    initializeInventoryCrudModal({ form, mode: 'create' });
    const create = vi.fn(async () => ({ message: 'OK' }));
    await handleSubmit({ form, formData: { name: 'Nueva merma' }, create });
    expect(create).toHaveBeenCalledWith({ formData: { name: 'Nueva merma' } });
  });
});
