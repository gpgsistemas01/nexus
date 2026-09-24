import { beforeEach, describe, expect, it, vi } from 'vitest';

const initializeInventoryCrudModal = vi.fn();
const openModal = vi.fn();

vi.mock('../../../../../../../src/public/js/ui/inventory/inventoryCrudModalUI.js', () => ({
  initializeInventoryCrudModal
}));

vi.mock('../../../../../../../src/public/js/ui/modalUI.js', () => ({
  openModal
}));

vi.mock('../../../../../../../src/public/js/utils/warehouseInventoryUtils.js', () => ({
  buildInventorySelectText: ({ name }) => name,
  getCurrentStock: ({ currentStock }) => currentStock
}));

vi.mock('../../../../../../../src/public/js/utils/formatUtils.js', () => ({
  formatDecimal: value => `${ value }.00`
}));

const { FORM_MODES } = await import('../../../../../../../src/public/js/constants/formModes.js');
const { openWasteStockAdditionModal } = await import(
  '../../../../../../../src/public/js/pages/warehouse/wastes/wasteStockAdditionModal.js'
);

describe('modal para agregar existencia de merma', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('abre un formulario dedicado con la identidad y existencia actuales', () => {
    const form = {};
    const modal = {};
    const name = { textContent: '' };
    const currentStock = { textContent: '' };
    const submit = { textContent: '' };
    form.querySelector = vi.fn(() => submit);

    vi.stubGlobal('document', {
      querySelector: vi.fn(selector => ({
        '#wasteStockAdditionForm': form,
        '#wasteStockAdditionModal': modal,
        '#wasteStockAdditionName': name,
        '#wasteStockAdditionCurrentStock': currentStock
      })[selector])
    });

    const data = { id: 7, name: 'Recorte blanco', currentStock: 12 };

    openWasteStockAdditionModal({ data });

    expect(initializeInventoryCrudModal).toHaveBeenCalledWith({
      form,
      mode: FORM_MODES.ADD_STOCK,
      data
    });
    expect(name.textContent).toBe('Recorte blanco');
    expect(currentStock.textContent).toBe('12.00');
    expect(submit.textContent).toBe('Agregar');
    expect(openModal).toHaveBeenCalledWith(modal);
  });
});
