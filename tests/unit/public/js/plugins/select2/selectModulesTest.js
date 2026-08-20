import { beforeEach, describe, expect, it, vi } from 'vitest';

const selectMocks = vi.hoisted(() => ({
  initPresentationSelect: vi.fn(),
  initReasonSelect: vi.fn(),
  setupSupplierSelect: vi.fn(),
  initUnitMeasureSelect: vi.fn(),
  setupWasteSelect: vi.fn(),
  toggleWasteOption: vi.fn(),
  headerSelects: {
    init: vi.fn(),
    setOptions: vi.fn(),
    syncState: vi.fn()
  },
  headerConfig: null,
  createIssueHeaderSelects: vi.fn()
}));

selectMocks.createIssueHeaderSelects.mockImplementation((config) => {
  selectMocks.headerConfig = config;
  return selectMocks.headerSelects;
});

vi.mock('../../../../../../src/public/js/plugins/select2/domains/presentation.js', () => ({
  initPresentationSelect: selectMocks.initPresentationSelect,
  togglePresentationOption: vi.fn()
}));
vi.mock('../../../../../../src/public/js/plugins/select2/domains/reason.js', () => ({
  initReasonSelect: selectMocks.initReasonSelect
}));
vi.mock('../../../../../../src/public/js/plugins/select2/domains/supplier.js', () => ({
  setupSupplierSelect: selectMocks.setupSupplierSelect,
  toggleSupplierOption: vi.fn()
}));
vi.mock('../../../../../../src/public/js/plugins/select2/domains/unitMeasure.js', () => ({
  initUnitMeasureSelect: selectMocks.initUnitMeasureSelect,
  toggleUnitMeasureOption: vi.fn()
}));
vi.mock('../../../../../../src/public/js/plugins/select2/domains/waste.js', () => ({
  setupWasteSelect: selectMocks.setupWasteSelect,
  toggleWasteOption: selectMocks.toggleWasteOption
}));
vi.mock('../../../../../../src/public/js/plugins/select2/modules/issueHeaderSelect.js', () => ({
  createIssueHeaderSelects: selectMocks.createIssueHeaderSelects
}));

const { initMaterialFormSelect2 } = await import('../../../../../../src/public/js/plugins/select2/modules/materialSelect.js');
const { getWasteIssueHeaderSelects } = await import('../../../../../../src/public/js/plugins/select2/modules/wasteIssueSelect.js');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('selects reutilizados en el CRUD de materiales', () => {
  it('respeta el contrato de selector relativo y el contenedor del modal', () => {
    initMaterialFormSelect2({ modalSelector: '#materialModal' });

    expect(selectMocks.setupSupplierSelect).toHaveBeenCalledWith({
      modalSelector: '#materialModal',
      supplierSelector: '.supplier-select'
    });
    expect(selectMocks.initReasonSelect).toHaveBeenCalledWith({
      modalSelector: '#materialModal',
      baseSelector: '#materialModal #reasonInput',
      allowCreate: false
    });
  });

  it('vuelve a delimitar los controles cuando el componente se monta en otro modal', () => {
    initMaterialFormSelect2({ modalSelector: '#alternateMaterialModal' });

    expect(selectMocks.initUnitMeasureSelect).toHaveBeenCalledWith(expect.objectContaining({
      baseSelector: '#alternateMaterialModal #unitMeasureInput'
    }));
  });
});

describe('selects reutilizados en el CRUD de salidas de merma', () => {
  it('configura el encabezado contra su formulario real', () => {
    expect(selectMocks.headerConfig).toEqual(expect.objectContaining({
      modalSelector: '#wasteIssueModal',
      formSelector: '#wasteIssueForm'
    }));
  });

  it('limpia el select de merma y no el formulario al preparar el registro', () => {
    getWasteIssueHeaderSelects().setOptions(null);

    expect(selectMocks.toggleWasteOption).toHaveBeenCalledWith({
      selector: '#wasteIssueModal #wasteInput',
      data: { id: null, text: null }
    });
  });
});
