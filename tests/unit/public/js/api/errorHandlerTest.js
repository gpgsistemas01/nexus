import { beforeEach, describe, expect, it, vi } from 'vitest';

const showError = vi.fn();

vi.mock('../../../../../src/public/js/plugins/swal/swalComponent.js', () => ({
  notifications: {
    showError,
    showModal: vi.fn(),
    showWarning: vi.fn()
  }
}));

vi.mock('../../../../../src/public/js/ui/forms/formErrorsUI.js', () => ({
  clearFormErrors: vi.fn(),
  normalizeFormErrors: vi.fn(),
  scrollToFirstFormError: vi.fn()
}));

vi.mock('../../../../../src/public/js/ui/forms/formStateUI.js', () => ({
  resetFormSubmitState: vi.fn()
}));

vi.mock('../../../../../src/public/js/utils/formUtils.js', () => ({
  mapServerErrors: vi.fn()
}));

const { handleDataTableError } = await import('../../../../../src/public/js/api/errorHandler.js');

describe('notificaciones de errores de tablas', () => {
  beforeEach(() => vi.clearAllMocks());

  it('muestra el mensaje seguro y el código del error de esquema', () => {
    handleDataTableError({
      status: 503,
      data: {
        code: 'PRISMA_CLIENT_OUT_OF_SYNC',
        message: 'El cliente de base de datos no está actualizado. Contacta a soporte.'
      }
    });

    expect(showError).toHaveBeenCalledWith(
      'El cliente de base de datos no está actualizado. Contacta a soporte. (Código: PRISMA_CLIENT_OUT_OF_SYNC)'
    );
  });
});
