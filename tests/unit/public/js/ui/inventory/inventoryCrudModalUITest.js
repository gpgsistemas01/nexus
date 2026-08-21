import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  clearFormErrors: vi.fn(),
  initForm: vi.fn(),
  setFormDisabled: vi.fn()
}));

vi.mock('../../../../../../src/public/js/ui/forms/formErrorsUI.js', () => ({
  clearFormErrors: mocks.clearFormErrors
}));
vi.mock('../../../../../../src/public/js/ui/forms/formStateUI.js', () => ({
  initForm: mocks.initForm,
  setFormDisabled: mocks.setFormDisabled
}));

import { initializeInventoryCrudModal } from '../../../../../../src/public/js/ui/inventory/inventoryCrudModalUI.js';

describe('initializeInventoryCrudModal', () => {
  beforeEach(() => vi.clearAllMocks());

  it.each([
    ['compra', 'create', null, false, ''],
    ['salida', 'view', { id: 41 }, true, 41]
  ])('prepara el formulario CRUD de %s', (_context, mode, data, isDisabled, id) => {
    const form = {};

    initializeInventoryCrudModal({ form, mode, data, isDisabled });

    expect(mocks.initForm).toHaveBeenCalledWith({ form, mode, id });
    expect(mocks.clearFormErrors).toHaveBeenCalledWith(form);
    expect(mocks.setFormDisabled).toHaveBeenCalledWith({ form, isDisabled });
  });
});
