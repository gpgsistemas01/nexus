import { beforeEach, describe, expect, it, vi } from 'vitest';

const setFormDisabled = vi.fn();
const setFormSectionVisibility = vi.fn();

vi.mock('../../../../../../../src/public/js/plugins/select2/modules/wasteSelect.js', () => ({
  initWasteSelect2: vi.fn(),
  setWasteSelectOptions: vi.fn()
}));

vi.mock('../../../../../../../src/public/js/plugins/select2/domains/reason.js', () => ({
  setReasonVisualOption: vi.fn()
}));

vi.mock('../../../../../../../src/public/js/ui/forms/formStateUI.js', () => ({
  setFormDisabled,
  setFormSectionVisibility
}));

vi.mock('../../../../../../../src/public/js/ui/inventory/inventoryCrudModalUI.js', () => ({
  initializeInventoryCrudModal: vi.fn()
}));

vi.mock('../../../../../../../src/public/js/ui/inventory/inventorySelectUI.js', () => ({
  displayWasteMaterialTemplate: vi.fn()
}));

vi.mock('../../../../../../../src/public/js/ui/modalUI.js', () => ({
  openModal: vi.fn()
}));

const { FORM_MODES } = await import('../../../../../../../src/public/js/constants/formModes.js');
const { openWasteModal } = await import(
  '../../../../../../../src/public/js/pages/warehouse/wastes/wasteModal.js'
);

const createInput = () => ({ value: '', checked: false });

describe('modal del CRUD de mermas', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const submit = { textContent: '' };
    const heading = { textContent: '' };
    const form = {
      elements: {
        base: createInput(),
        height: createInput(),
        isActive: createInput(),
        maxUnitCost: createInput(),
        minStock: createInput(),
        newStock: createInput(),
        observations: createInput()
      },
      querySelector: () => submit
    };
    const modal = { querySelector: () => heading };

    vi.stubGlobal('document', {
      querySelector: selector => selector === '#wasteForm' ? form : modal
    });
  });

  it.each([
    [FORM_MODES.CREATE, false],
    [FORM_MODES.EDIT, false],
    [FORM_MODES.EDIT_STOCK, true]
  ])('mantiene el nombre como input y aplica su estado en modo %s', (mode, isDisabled) => {
    openWasteModal({ mode, data: { name: 'Recorte' } });

    expect(setFormDisabled).toHaveBeenCalledWith(expect.objectContaining({
      fields: ['name'],
      isDisabled
    }));
  });
});
