import { beforeEach, describe, expect, it, vi } from 'vitest';

const selectMocks = vi.hoisted(() => ({
  initPresentationSelect: vi.fn(),
  initReasonSelect: vi.fn(),
  initSupplierMaterialSelect: vi.fn(),
  toggleSupplierMaterialOption: vi.fn(),
  setupSupplierSelect: vi.fn(),
  toggleSupplierOption: vi.fn(),
  setupMaterialSelect: vi.fn(),
  toggleMaterialOption: vi.fn(),
  initPersonSelect: vi.fn(),
  togglePersonOption: vi.fn(),
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
  initReasonSelect: selectMocks.initReasonSelect,
  toggleReasonOption: vi.fn()
}));
vi.mock('../../../../../../src/public/js/plugins/select2/domains/supplierMaterial.js', () => ({
  initSupplierMaterialSelect: selectMocks.initSupplierMaterialSelect,
  toggleSupplierMaterialOption: selectMocks.toggleSupplierMaterialOption
}));
vi.mock('../../../../../../src/public/js/plugins/select2/domains/supplier.js', () => ({
  setupSupplierSelect: selectMocks.setupSupplierSelect,
  toggleSupplierOption: selectMocks.toggleSupplierOption
}));
vi.mock('../../../../../../src/public/js/plugins/select2/domains/material.js', () => ({
  setupMaterialSelect: selectMocks.setupMaterialSelect,
  toggleMaterialOption: selectMocks.toggleMaterialOption
}));
vi.mock('../../../../../../src/public/js/plugins/select2/domains/person.js', () => ({
  initPersonSelect: selectMocks.initPersonSelect,
  togglePersonOption: selectMocks.togglePersonOption
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
vi.mock('../../../../../../src/public/js/plugins/select2/baseSelect.js', () => ({
  bindDisabledSelectDependency: vi.fn()
}));
vi.mock('../../../../../../src/public/js/plugins/datatable/shared/inventory/renderMaterialDatatable.js', () => ({
  refreshMaterialTable: vi.fn()
}));
vi.mock('../../../../../../src/public/js/plugins/datatable/warehouse/goodsReceipts/goodsReceiptDatatable.js', () => ({
  details: []
}));

const { initMaterialFormSelect2 } = await import('../../../../../../src/public/js/plugins/select2/modules/materialSelect.js');
const { setGoodsReceiptFormSelectOptions } = await import('../../../../../../src/public/js/plugins/select2/modules/goodsReceiptSelect.js');
const { initWasteSelect2, setWasteSelectOptions } = await import('../../../../../../src/public/js/plugins/select2/modules/wasteSelect.js');
const { getWasteIssueHeaderSelects } = await import('../../../../../../src/public/js/plugins/select2/modules/wasteIssueSelect.js');

beforeEach(() => {
  vi.clearAllMocks();
  const select = {
    off: vi.fn(),
    on: vi.fn()
  };
  select.off.mockReturnValue(select);
  select.on.mockReturnValue(select);
  vi.stubGlobal('$', vi.fn(() => select));
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

describe('selects del formulario del CRUD de entradas de compra', () => {
  it('limpia el material una sola vez al preparar las opciones del encabezado', () => {
    setGoodsReceiptFormSelectOptions({
      supplierId: 'supplier-1',
      supplierName: 'Proveedor Norte',
      receivedById: 'person-1',
      receivedByName: 'Persona Almacén'
    });

    expect(selectMocks.toggleSupplierOption).toHaveBeenCalledWith({
      selector: '#goodsReceiptModal .supplier-select',
      id: 'supplier-1',
      name: 'Proveedor Norte'
    });
    expect(selectMocks.togglePersonOption).toHaveBeenCalledWith({
      selector: '#goodsReceiptModal #receivedByInput',
      id: 'person-1',
      name: 'Persona Almacén'
    });
    expect(selectMocks.toggleMaterialOption).toHaveBeenCalledTimes(1);
    expect(selectMocks.toggleMaterialOption).toHaveBeenCalledWith({
      selector: '#goodsReceiptModal #materialInput',
      data: { id: null, text: null }
    });
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

describe('select de material en el CRUD de mermas', () => {
  it('consulta materiales con el selector delimitado por el modal', () => {
    initWasteSelect2({ modalSelector: '#wasteModal' });

    expect(selectMocks.initSupplierMaterialSelect).toHaveBeenCalledWith({
      modalSelector: '#wasteModal',
      baseSelector: '#wasteModal #materialInput',
      allowCreate: false
    });
  });

  it('recalcula el selector cuando el componente se reutiliza en otro modal', () => {
    initWasteSelect2({ modalSelector: '#alternateWasteModal' });

    expect(selectMocks.initSupplierMaterialSelect).toHaveBeenCalledWith(expect.objectContaining({
      baseSelector: '#alternateWasteModal #materialInput'
    }));
  });

  it('reutiliza el adaptador de materiales al editar una merma', () => {
    initWasteSelect2({ modalSelector: '#wasteModal' });
    setWasteSelectOptions({
      modalSelector: '#wasteModal',
      data: {
        supplierMaterial: {
          id: 'supplier-material-1',
          material: {
            name: 'Lámina',
            base: 2,
            height: 3,
            presentation: { name: 'ROLLO' }
          },
          supplier: { tradeName: 'Proveedor Norte' }
        }
      }
    });

    expect(selectMocks.toggleSupplierMaterialOption).toHaveBeenCalledWith(expect.objectContaining({
      selector: '#wasteModal #materialInput',
      data: expect.objectContaining({
        id: 'supplier-material-1',
        text: 'Lámina (2 × 3) · Proveedor Norte'
      })
    }));
  });
});
