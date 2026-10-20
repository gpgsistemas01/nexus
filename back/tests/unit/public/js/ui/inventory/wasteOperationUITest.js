import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

const confirmation = vi.hoisted(() => vi.fn());
vi.mock('../../../../../../src/public/js/plugins/swal/swalComponent.js', () => ({
  notifications: { showConfirmation: confirmation, showWarning: vi.fn() }
}));
const { getPendingWasteOperation, submitWasteOperation } = await import('../../../../../../src/public/js/ui/inventory/wasteOperationUI.js');
let saved;
beforeEach(() => {
  saved = new Map();
  vi.stubGlobal('window', { meta: { id: 'actor-1' } });
  vi.stubGlobal('localStorage', {
    getItem: key => saved.get(key) ?? null,
    setItem: (key, value) => saved.set(key, value),
    removeItem: key => saved.delete(key)
  });
  confirmation.mockResolvedValue({ isConfirmed: true });
});
afterEach(() => vi.unstubAllGlobals());

const options = { action: 'add-stock', id: 'waste-1', formData: { quantity: 2 } };
describe('recuperación de capturas de merma (DP-CON-001)', () => {
  it('persiste la clave antes de enviar y la retira sólo tras confirmar éxito', async () => {
    const submit = vi.fn(async data => {
      expect(getPendingWasteOperation(options)).toEqual(data);
      expect(data.operationId).toMatch(/^[0-9a-f-]{36}$/);
      return { id: 'waste-1' };
    });
    expect(await submitWasteOperation({ ...options, submit })).toEqual({ id: 'waste-1' });
    expect(getPendingWasteOperation(options)).toBeNull();
  });

  it.each([0, 500])('conserva la captura ante error ambiguo %i y reenvía la misma clave/cantidad tras recargar', async status => {
    await expect(submitWasteOperation({ ...options, submit: async () => { throw { status }; } })).rejects.toEqual({ status });
    const pending = getPendingWasteOperation(options);
    const submit = vi.fn(async () => ({ id: 'waste-1' }));
    await submitWasteOperation({ ...options, formData: { quantity: 99 }, submit });
    expect(submit).toHaveBeenCalledWith(pending);
    expect(submit.mock.calls[0][0].quantity).toBe(2);
    expect(getPendingWasteOperation(options)).toBeNull();
  });

  it('cancelar la recuperación conserva la captura y no envía otra entrada', async () => {
    await submitWasteOperation({ ...options, submit: async () => { throw { status: 0 }; } }).catch(() => {});
    confirmation.mockResolvedValueOnce({ isConfirmed: false });
    const submit = vi.fn();
    await submitWasteOperation({ ...options, submit });
    expect(submit).not.toHaveBeenCalled();
    expect(getPendingWasteOperation(options).quantity).toBe(2);
    expect(getPendingWasteOperation({ ...options, id: 'waste-2' })).toBeNull();
    window.meta.id = 'actor-2';
    expect(getPendingWasteOperation(options)).toBeNull();
  });

  it('un rechazo inicial de validación permite corregir la captura con una clave nueva', async () => {
    await expect(submitWasteOperation({ ...options, submit: async () => { throw { status: 400 }; } })).rejects.toEqual({ status: 400 });
    expect(getPendingWasteOperation(options)).toBeNull();
  });

  it('si no puede guardar la recuperación, no escribe en el servidor', async () => {
    localStorage.setItem = () => { throw new Error('Almacenamiento no disponible'); };
    const submit = vi.fn();
    await expect(submitWasteOperation({ ...options, submit })).rejects.toThrow('Almacenamiento no disponible');
    expect(submit).not.toHaveBeenCalled();
  });
});

it('permite corregir un pendiente si el servidor confirma el rollback, pero conserva uno sin permiso', async () => {
  await submitWasteOperation({ ...options, submit: async () => { throw { status: 0 }; } }).catch(() => {});
  await submitWasteOperation({ ...options, submit: async () => { throw { status: 403 }; } }).catch(() => {});
  expect(getPendingWasteOperation(options)).not.toBeNull();
  await submitWasteOperation({ ...options, submit: async () => { throw { status: 404, data: { meta: { operationRejected: true } } }; } }).catch(() => {});
  expect(getPendingWasteOperation(options)).toBeNull();
});
