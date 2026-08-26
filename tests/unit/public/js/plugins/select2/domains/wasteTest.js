import { beforeEach, describe, expect, it, vi } from 'vitest';

const selectMocks = vi.hoisted(() => ({
  initDomainSelect2: vi.fn(),
  updatePresentationDisplay: vi.fn()
}));

vi.mock('../../../../../../../src/public/js/plugins/select2/baseSelect.js', () => ({
  buildPaginatedSelectParams: vi.fn(),
  initDomainSelect2: selectMocks.initDomainSelect2,
  toggleSelectOption: vi.fn()
}));
vi.mock('../../../../../../../src/public/js/ui/inventory/inventorySelectUI.js', () => ({
  updatePresentationDisplay: selectMocks.updatePresentationDisplay
}));
vi.mock('../../../../../../../src/public/js/application/warehouse/wastes/wastes.js', () => ({
  getAllWastes: vi.fn()
}));

const handlers = new Map();
const select = {
  off: vi.fn(() => select),
  on: vi.fn((event, handler) => {
    handlers.set(event, handler);
    return select;
  })
};

vi.stubGlobal('$', vi.fn(() => select));

const { setupWasteSelect } = await import(
  '../../../../../../../src/public/js/plugins/select2/domains/waste.js'
);

describe('selección de merma del CRUD de salidas', () => {
  beforeEach(() => {
    handlers.clear();
    vi.clearAllMocks();
  });

  it('actualiza la presentación al seleccionar una merma', () => {
    const option = {};
    const data = {
      id: 'waste-1',
      text: 'Lona (1.5 × 2)',
      presentation: JSON.stringify({ id: 'presentation-1', name: 'ROLLO' }),
      unitMeasure: JSON.stringify({ id: 'unit-1', symbol: 'm²' })
    };

    setupWasteSelect({
      modalSelector: '#wasteIssueModal',
      wasteSelector: '#wasteInput'
    });
    handlers.get('select2:select')({
      params: { data },
      target: { querySelector: vi.fn(() => option) }
    });

    expect(selectMocks.updatePresentationDisplay).toHaveBeenCalledWith({
      modalSelector: '#wasteIssueModal',
      data,
      presentation: { id: 'presentation-1', name: 'ROLLO' },
      option
    });
  });
});
