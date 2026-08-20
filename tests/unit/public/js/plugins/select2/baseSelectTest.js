import { beforeEach, describe, expect, it, vi } from 'vitest';

const mdbMocks = vi.hoisted(() => ({
  initMdbWrapperInput: vi.fn(),
  updateMdbWrapperInput: vi.fn()
}));

vi.mock('../../../../../../src/public/js/plugins/mdb/baseInstance.js', () => mdbMocks);
vi.mock('../../../../../../src/public/js/ui/disabledControlWarning.js', () => ({
  bindDisabledControlWarning: vi.fn(),
  setDisabledControlWarning: vi.fn()
}));

const { buildPaginatedSelectResults, updatePresentationDisplay } = await import(
  '../../../../../../src/public/js/plugins/select2/baseSelect.js'
);

beforeEach(() => {
  vi.clearAllMocks();
  mdbMocks.initMdbWrapperInput.mockReturnValue({ id: 'presentation-wrapper' });
});

describe('contrato de resultados remotos de Select2', () => {
  it('consume las opciones ya resueltas por la capa de aplicación', () => {
    expect(buildPaginatedSelectResults([
      { value: 'status-1', label: 'Pendiente' }
    ])).toEqual({
      results: [{ value: 'status-1', label: 'Pendiente' }],
      pagination: { more: false }
    });
  });
});

describe('presentación compartida por los selects de los CRUD de compras y salidas', () => {
  it('sincroniza los datos de la opción y el campo visual dentro del modal activo', () => {
    const option = { dataset: {} };

    updatePresentationDisplay({
      modalSelector: '#goodsReceiptModal',
      data: { id: 'material-1', material: '{"id":"material-1"}' },
      presentation: { name: 'ROLLO' },
      option
    });

    expect(option.dataset).toEqual({
      id: 'material-1',
      material: '{"id":"material-1"}'
    });
    expect(mdbMocks.initMdbWrapperInput).toHaveBeenCalledWith({
      selector: '#goodsReceiptModal #presentationDisplayInput',
      value: 'ROLLO'
    });
    expect(mdbMocks.updateMdbWrapperInput).toHaveBeenCalledWith({ id: 'presentation-wrapper' });
  });

  it('no modifica la presentación cuando el select no aporta una opción', () => {
    updatePresentationDisplay({
      modalSelector: '#goodsIssueModal',
      data: { id: 'material-1' },
      presentation: { name: 'PIEZA' },
      option: null
    });

    expect(mdbMocks.initMdbWrapperInput).not.toHaveBeenCalled();
    expect(mdbMocks.updateMdbWrapperInput).not.toHaveBeenCalled();
  });
});
