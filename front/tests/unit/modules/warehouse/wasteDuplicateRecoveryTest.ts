import { afterEach, describe, expect, it, vi } from 'vitest';
import { useWasteDuplicateRecovery } from '../../../../src/modules/warehouse/composables/useWasteDuplicateRecovery.js';
import { initialInventoryValues } from '../../../../src/modules/warehouse/formModel.js';
import { ApiError } from '../../../../src/shared/http/apiError.js';
import * as feedback from '../../../../src/shared/ui/feedback.js';
import { waste } from '../../../fixtures/inventory.js';

const duplicate = (meta: Record<string, unknown> = {}) =>
  new ApiError(
    'Esta merma ya existe.',
    409,
    'WASTE_ALREADY_EXISTS',
    {},
    {
      waste: { ...waste, version: undefined },
      operationRejected: true,
      ...meta,
    },
  );
const setup = (canAddStock = true) => {
  const controller = new AbortController();
  const onAddStock = vi.fn();
  const confirm = vi.spyOn(feedback, 'confirmAction').mockResolvedValue(true);
  const recovery = useWasteDuplicateRecovery({
    canAddStock,
    signal: controller.signal,
    onAddStock,
  });
  return { controller, onAddStock, confirm, ...recovery };
};
afterEach(() => vi.restoreAllMocks());

describe('CU-ALM-10 A2: traspaso confirmado al modal de entrada', () => {
  it.each([
    ['3', '3'],
    ['0', ''],
  ])(
    'traslada cantidad inicial %s y observaciones sin inventar una versión',
    async (initialQuantity, quantity) => {
      const recovery = setup();
      expect(
        await recovery.recover(duplicate(), {
          initialQuantity,
          observations: 'Captura conservada',
        }),
      ).toBe(true);
      const target = recovery.onAddStock.mock.calls[0]![0];
      expect(target.action).toBe('add-stock');
      expect(target.row.entityId).toBe(waste.id);
      expect(target.row).not.toHaveProperty('version');
      expect(initialInventoryValues(target)).toMatchObject({
        quantity,
        observations: 'Captura conservada',
      });
    },
  );
  it.each([
    ['sin permiso', false, duplicate()],
    ['sin identidad', true, duplicate({ waste: {} })],
    ['resultado incierto', true, duplicate({ operationRejected: false })],
    ['otro conflicto', true, new ApiError('Conflicto', 409, 'RECORD_VERSION_CONFLICT')],
  ] as const)(
    '%s no ofrece transición ni llama al contenedor',
    async (_condition, allowed, error) => {
      const recovery = setup(allowed);
      expect(await recovery.recover(error, { initialQuantity: 3 })).toBe(false);
      expect(recovery.confirm).not.toHaveBeenCalled();
      expect(recovery.onAddStock).not.toHaveBeenCalled();
    },
  );
  it('cancelar conserva el alta y desmontar durante la confirmación impide la transición tardía', async () => {
    const recovery = setup();
    recovery.confirm.mockResolvedValueOnce(false);
    expect(await recovery.recover(duplicate(), {})).toBe(false);
    expect(recovery.onAddStock).not.toHaveBeenCalled();
    let finish!: (confirmed: boolean) => void;
    recovery.confirm.mockReturnValueOnce(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    const pending = recovery.recover(duplicate(), {});
    expect(recovery.isConfirming.value).toBe(true);
    expect(await recovery.recover(duplicate(), {})).toBe(false);
    recovery.controller.abort();
    finish(true);
    expect(await pending).toBe(false);
    expect(recovery.isConfirming.value).toBe(false);
    expect(recovery.onAddStock).not.toHaveBeenCalled();
  });
});
