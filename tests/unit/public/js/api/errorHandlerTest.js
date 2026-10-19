import { beforeEach, describe, expect, it, vi } from 'vitest';

const showError = vi.fn();

vi.mock('../../../../../src/public/js/plugins/swal/swalComponent.js', () => ({
  notifications: {
    showError,
    showModal: vi.fn(),
    showWarning: vi.fn()
  }
}));

vi.mock('../../../../../src/public/js/ui/forms/formStateUI.js', () => ({
  resetFormSubmitState: vi.fn()
}));

const { notifications } = await import('../../../../../src/public/js/plugins/swal/swalComponent.js');
const { handleApiError, handleDataTableError, runApiAction } = await import('../../../../../src/public/js/api/errorHandler.js');
const { resetFormSubmitState } = await import('../../../../../src/public/js/ui/forms/formStateUI.js');
const { getErrorMessage } = await import('../../../../../src/public/js/constants/apiMessages.js');

const createForm = ({ field = null, detailId = null, mode = 'edit', hasInput = true, hidden = false } = {}) => {
  const createElement = () => {
    const classes = new Set(['d-none']);
    return {
      textContent: '',
      classList: {
        contains: value => classes.has(value),
        add: value => classes.add(value),
        remove: value => classes.delete(value),
        toggle: (value, enabled) => enabled ? classes.add(value) : classes.delete(value)
      },
      removeAttribute() {},
      closest: selector => selector.includes('.d-none') && (hidden || classes.has('d-none')) ? {} : null,
      scrollIntoView() {},
      focus() {}
    };
  };
  const input = field && hasInput ? createElement() : null;
  const feedback = field ? createElement() : null;
  const feedbackKey = detailId ? `${field}-${detailId}` : field;
  if (feedback) feedback.dataset = { errorFor: feedbackKey };

  const form = {
    dataset: { mode },
    querySelector(selector) {
      if (selector === '.is-invalid, [aria-invalid="true"]') return input?.classList.contains('is-invalid') ? input : null;
      if (selector.includes('data-error-for')) return selector.match(/data-error-for=['"]?([^'"\]]+)/)?.[1] === feedbackKey ? feedback : null;
      if (selector.includes('data-detail-id') && !selector.includes(`"${detailId}"`)) return null;
      return selector.match(/name=['"]([^'"]+)/)?.[1] === field ? input : null;
    },
    querySelectorAll(selector) {
      if (selector.includes('[data-error-for]')) return feedback ? [feedback] : [];
      if (selector.includes('.is-invalid')) return input?.classList.contains('is-invalid') ? [input] : [];
      return [];
    }
  };

  return { form, feedback };
};

const validationError = errors => ({
  status: 400,
  data: { code: 'VALIDATION_ERROR', errors },
  message: 'Errores de validación.'
});

describe('errores de validación desde la API hasta la notificación', () => {
  beforeEach(() => vi.clearAllMocks());

  it.each([
    ['operationId', 'OPERATION_ID_REQUIRED'],
    ['expectedVersion', 'RECORD_VERSION_REQUIRED']
  ])('muestra en Swal %s cuando no hay un campo donde corregirlo', (field, code) => {
    const { form } = createForm();

    handleApiError({ err: validationError({ [field]: { code } }), form });

    expect(notifications.showModal).toHaveBeenCalledExactlyOnceWith({
      title: expect.any(String),
      text: getErrorMessage({ code }),
      icon: 'warning'
    });
    expect(resetFormSubmitState).toHaveBeenCalledWith(form);
  });

  it.each([
    [400, 'RECORD_ID_INVALID'],
    [404, 'WASTE_NOT_FOUND']
  ])('conserva el aviso existente para una consulta rechazada con HTTP %s', async (status, code) => {
    const err = { status, data: { code } };
    const read = vi.fn().mockRejectedValue(err);
    const open = vi.fn();

    await runApiAction(async () => open(await read()));

    expect(notifications.showModal).toHaveBeenCalledExactlyOnceWith({
      title: getErrorMessage({ code }),
      text: null,
      icon: 'warning'
    });
    expect(open).not.toHaveBeenCalled();
  });

  it.each([
    [400, 'RECORD_ID_INVALID'],
    [404, 'WASTE_NOT_FOUND']
  ])('muestra el rechazo global HTTP %s aunque la acción tenga un formulario', (status, code) => {
    const { form } = createForm({ field: 'name' });

    handleApiError({ err: { status, data: { code } }, form });

    expect(notifications.showModal).toHaveBeenCalledExactlyOnceWith({
      title: getErrorMessage({ code }),
      text: null,
      icon: 'warning'
    });
    expect(resetFormSubmitState).toHaveBeenCalledWith(form);
  });

  it('conserva el error del campo en el formulario sin duplicarlo en Swal', () => {
    const { form, feedback } = createForm({ field: 'name' });

    handleApiError({ err: validationError({ name: { code: 'NAME_REQUIRED' } }), form });

    expect(feedback.textContent).toBe(getErrorMessage({ code: 'NAME_REQUIRED' }));
    expect(notifications.showModal).not.toHaveBeenCalled();
    expect(showError).not.toHaveBeenCalled();
  });

  it('avisa de metadatos incompletos aunque también haya un campo por corregir', () => {
    const { form, feedback } = createForm({ field: 'name' });

    handleApiError({ err: validationError({ expectedVersion: { code: 'RECORD_VERSION_REQUIRED' }, name: { code: 'NAME_REQUIRED' } }), form });

    expect(feedback.textContent).toBe(getErrorMessage({ code: 'NAME_REQUIRED' }));
    expect(notifications.showModal).toHaveBeenCalledWith(expect.objectContaining({
      text: getErrorMessage({ code: 'RECORD_VERSION_REQUIRED' })
    }));
  });

  it('mantiene el error de una partida junto a su campo al surtir', () => {
    const detailId = '15621a53-3a58-4763-a9fe-c45fbd173974';
    const { form, feedback } = createForm({ field: 'quantity', detailId, mode: 'edit-detail' });

    handleApiError({ err: validationError({ [detailId]: { quantity: { code: 'QUANTITY_REQUIRED' } } }), form });

    expect(feedback.textContent).toBe(getErrorMessage({ code: 'QUANTITY_REQUIRED' }));
    expect(notifications.showModal).not.toHaveBeenCalled();
  });

  it('muestra el rechazo de detalles ausentes sin un input con ese nombre', () => {
    const { form, feedback } = createForm({ field: 'details', hasInput: false });

    handleApiError({ err: validationError({ details: { code: 'DETAILS_REQUIRED' } }), form });

    expect(feedback.textContent).toBe(getErrorMessage({ code: 'DETAILS_REQUIRED' }));
    expect(notifications.showModal).not.toHaveBeenCalled();
  });

  it('muestra un aviso cuando el error pertenece a una sección oculta', () => {
    const { form } = createForm({ field: 'name', hidden: true });

    handleApiError({ err: validationError({ name: { code: 'NAME_REQUIRED' } }), form });

    expect(notifications.showModal).toHaveBeenCalledWith(expect.objectContaining({
      text: getErrorMessage({ code: 'NAME_REQUIRED' })
    }));
  });

  it('traduce también el formato de lista de express-validator', () => {
    handleApiError({ err: validationError([{ path: 'supplierId', location: 'body', msg: 'SUPPLIER_ID_INVALID_UUID' }]) });

    expect(notifications.showModal).toHaveBeenCalledWith(expect.objectContaining({
      text: getErrorMessage({ code: 'SUPPLIER_ID_INVALID_UUID' })
    }));
  });

  it('mantiene un aviso para un 400 sin errores de campo', () => {
    const { form } = createForm();

    handleApiError({ err: validationError({}), form });

    expect(notifications.showModal).toHaveBeenCalledWith(expect.objectContaining({ text: 'Errores de validación.' }));
  });
});

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

  it('muestra el error de parámetro específico al fallar la carga de una tabla', () => {
    expect(handleDataTableError({ status: 400, data: { code: 'RECORD_ID_INVALID' } })).toEqual([]);

    expect(notifications.showModal).toHaveBeenCalledWith(expect.objectContaining({
      title: getErrorMessage({ code: 'RECORD_ID_INVALID' }),
      text: null
    }));
  });
});

describe('acciones de consulta y apertura de modal', () => {
  beforeEach(() => vi.clearAllMocks());

  it('entrega al modal el registro consultado en ese momento', async () => {
    const record = { id: 'record', version: 4, details: [{ id: 'detail' }] };
    const read = vi.fn().mockResolvedValue(record);
    const open = vi.fn();

    await runApiAction(async () => open(await read()));

    expect(open).toHaveBeenCalledWith(record);
    expect(showError).not.toHaveBeenCalled();
  });

  it('avisa del fallo de consulta sin abrir un modal con datos incompletos', async () => {
    const read = vi.fn().mockRejectedValue({ status: 503, message: 'Consulta no disponible' });
    const open = vi.fn();

    await expect(runApiAction(async () => open(await read()))).resolves.toBeUndefined();

    expect(open).not.toHaveBeenCalled();
    expect(showError).toHaveBeenCalledExactlyOnceWith('Consulta no disponible');
  });
});
