import { beforeEach, describe, expect, it, vi } from 'vitest';

const initDomainSelect2 = vi.fn();
const toggleSelectOption = vi.fn();

vi.mock('../../../../../../../src/public/js/plugins/select2/baseSelect.js', () => ({
  initDomainSelect2,
  toggleSelectOption
}));

vi.mock('../../../../../../../src/public/js/application/warehouse/wastes/wastes.js', () => ({
  getWasteMaterialTemplates: vi.fn()
}));

const handlers = new Map();
let selectedValue = null;
let nameDisplay;
let presentationDisplay;
let unitMeasureDisplay;
let baseInput;
let maxUnitCostInput;
let form;
const select = {
  off: vi.fn(() => select),
  on: vi.fn((events, handler) => {
    events.split(' ').forEach(event => handlers.set(event, handler));
    return select;
  }),
  val: vi.fn(() => selectedValue)
};

vi.stubGlobal('$', vi.fn(() => select));

const { initWasteMaterialTemplateSelect } = await import(
  '../../../../../../../src/public/js/plugins/select2/domains/wasteMaterialTemplate.js'
);

describe('selección de plantilla del CRUD de mermas', () => {
  beforeEach(() => {
    handlers.clear();
    selectedValue = null;
    vi.clearAllMocks();
    nameDisplay = { textContent: 'Lona' };
    presentationDisplay = { textContent: 'ROLLO' };
    unitMeasureDisplay = { textContent: 'm²' };
    const wrapper = {};
    baseInput = { value: '1.52', closest: () => wrapper, classList: { toggle: vi.fn() } };
    maxUnitCostInput = { value: '25', closest: () => wrapper, classList: { toggle: vi.fn() } };
    form = {
      querySelector: selector => ({
        '#wasteNameDisplayValue': nameDisplay,
        '#wastePresentationDisplayValue': presentationDisplay,
        '#wasteUnitMeasureDisplayValue': unitMeasureDisplay
      })[selector]
    };
    vi.stubGlobal('document', {
      querySelector: selector => ({
        '#wasteForm': form,
        '#baseInput': baseInput,
        '#maxUnitCostInput': maxUnitCostInput
      })[selector] ?? null
    });
    vi.stubGlobal('window', {
      mdb: { Input: { getOrCreateInstance: vi.fn(() => ({ update: vi.fn() })) } }
    });
  });

  it('limpia los datos relacionados cuando el material cambia a un valor vacío', () => {
    const data = vi.fn(() => ({ supplierId: 'supplier-1' }));

    initWasteMaterialTemplateSelect({
      modalSelector: '#wasteModal',
      baseSelector: '#materialInput',
      data
    });
    handlers.get('change.wasteMaterialTemplate')();

    expect(initDomainSelect2).toHaveBeenCalledWith(expect.objectContaining({ data }));
    expect(nameDisplay.value).toBe('');
    expect(presentationDisplay.textContent).toBe('—');
    expect(unitMeasureDisplay.textContent).toBe('—');
    expect(baseInput.value).toBe('');
    expect(maxUnitCostInput.value).toBe('');
  });

  it('conserva los datos relacionados mientras el material continúa seleccionado', () => {
    selectedValue = 'material-1';

    initWasteMaterialTemplateSelect({
      modalSelector: '#wasteModal',
      baseSelector: '#materialInput'
    });
    handlers.get('change.wasteMaterialTemplate')();

    expect(nameDisplay.textContent).toBe('Lona');
    expect(presentationDisplay.textContent).toBe('ROLLO');
    expect(unitMeasureDisplay.textContent).toBe('m²');
    expect(baseInput.value).toBe('1.52');
    expect(maxUnitCostInput.value).toBe('25');
  });

  it('limpia la plantilla desde el mismo dominio cuando cambia el proveedor', () => {
    initWasteMaterialTemplateSelect({
      modalSelector: '#wasteModal',
      baseSelector: '#materialInput',
      supplierSelector: '#supplierInput'
    });
    handlers.get('select2:select.wasteMaterialDependency')();

    expect(toggleSelectOption).toHaveBeenCalledWith({
      selector: '#materialInput',
      data: null
    });
  });
});
