import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  clearFormErrors: vi.fn(),
  initMdbModal: vi.fn(() => ({ hide: vi.fn() })),
  initMdbWrapperInput: vi.fn(() => ({})),
  resetFormSubmitState: vi.fn(),
  showModal: vi.fn(),
  updateMdbWrapperInput: vi.fn(),
  useForm: vi.fn(),
  validateFields: vi.fn(() => ({}))
}));

vi.mock('../../../../../../src/public/js/application/form.js', () => ({ useForm: mocks.useForm }));
vi.mock('../../../../../../src/public/js/plugins/mdb/baseInstance.js', () => ({
  initMdbModal: mocks.initMdbModal,
  initMdbWrapperInput: mocks.initMdbWrapperInput,
  showModal: mocks.showModal,
  updateMdbWrapperInput: mocks.updateMdbWrapperInput
}));
vi.mock('../../../../../../src/public/js/plugins/swal/swalComponent.js', () => ({
  notifications: { showError: vi.fn(), showSuccess: vi.fn() }
}));
vi.mock('../../../../../../src/public/js/ui/forms/formErrorsUI.js', () => ({ clearFormErrors: mocks.clearFormErrors }));
vi.mock('../../../../../../src/public/js/ui/forms/formStateUI.js', () => ({ resetFormSubmitState: mocks.resetFormSubmitState }));
vi.mock('../../../../../../src/public/js/utils/formUtils.js', () => ({
  validateFields: mocks.validateFields
}));

const { createIssueReturn } = await import('../../../../../../src/public/js/ui/issues/issueReturnUI.js');

describe('UI compartida de devolución del CRUD de salidas', () => {
  const form = { dataset: {}, reset: vi.fn() };
  const modal = {};

  beforeEach(() => {
    vi.clearAllMocks();
    form.dataset = {};
    globalThis.document = { querySelector: vi.fn(selector => {
      if (selector.endsWith('ReturnForm')) return form;
      if (selector.endsWith('Modal')) return modal;
      return { dataset: {}, textContent: '' };
    }) };
  });

  it.each(['salida de material', 'salida de merma'])(
    'reutiliza el flujo para %s y redondea el límite disponible',
    () => {
      const issueReturn = createIssueReturn({ sendReturn: vi.fn() });

      issueReturn.open({
        issue: { id: 'issue-1' },
        detail: {
          id: 'detail-1',
          name: 'Lámina (2 × 3) · Proveedor Norte',
          suppliedQuantity: 0.3,
          returnedQuantity: 0.2
        }
      });

      const availableSummary = document.querySelector.mock.results
        .find((_, index) => document.querySelector.mock.calls[index][0] === '#issueReturnAvailableQuantity').value;
      const materialValue = document.querySelector.mock.results
        .find((_, index) => document.querySelector.mock.calls[index][0] === '#issueReturnMaterialValue').value;
      expect(availableSummary.dataset.value).toBe('0.1');
      expect(materialValue.textContent).toBe('Lámina (2 × 3) · Proveedor Norte');
      expect(form.dataset).toMatchObject({
        id: 'issue-1',
        detailId: 'detail-1',
        availableQuantity: '0.1'
      });
      expect(mocks.showModal).toHaveBeenCalledOnce();
    }
  );

  it('acepta el valor límite y rechaza el primer valor superior', () => {
    createIssueReturn({ sendReturn: vi.fn() }).initialize();
    const configuration = mocks.useForm.mock.calls[0][0];
    const validationForm = { dataset: { availableQuantity: '0.1' } };

    expect(configuration.getErrors({
      form: validationForm,
      formData: { returnQuantity: 0.1 }
    })).toEqual({});
    expect(configuration.getErrors({
      form: validationForm,
      formData: { returnQuantity: 0.11 }
    })).toEqual({
      returnQuantity: 'La cantidad no puede exceder lo disponible para devolver.'
    });
  });
});
