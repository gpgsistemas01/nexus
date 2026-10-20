import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const showError = vi.fn();

vi.mock('../../../../../src/public/js/plugins/swal/swalComponent.js', () => ({
  notifications: {
    showError,
    showModal: vi.fn(),
    showWarning: vi.fn()
  }
}));

const { notifications } = await import('../../../../../src/public/js/plugins/swal/swalComponent.js');
const { handleApiError, runApiAction } = await import('../../../../../src/public/js/api/errorHandler.js');
const { getErrorMessage } = await import('../../../../../src/public/js/constants/apiMessages.js');

const createForm = ({ field = null, detailId = null, mode = 'edit', hasInput = true, hidden = false } = {}) => {
  const createElement = ({ isFeedback = false } = {}) => {
    const classes = new Set(isFeedback ? ['d-none'] : []);
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
  const feedback = field ? createElement({ isFeedback: true }) : null;
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
      title: getErrorMessage({ code }),
      text: null,
      icon: 'warning'
    });
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
      title: getErrorMessage({ code: 'RECORD_VERSION_REQUIRED' }),
      text: null
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

  it('no deja silencioso un error anidado cuando su partida ya no tiene controles visibles', () => {
    const { form } = createForm({ mode: 'edit-detail' });

    handleApiError({ err: validationError({ missingDetail: { quantity: { code: 'QUANTITY_REQUIRED' } } }), form });

    expect(notifications.showModal).toHaveBeenCalledExactlyOnceWith({ title: 'Errores de validación.', text: null, icon: 'warning' });
  });

  it('muestra un aviso cuando el error pertenece a una sección oculta', () => {
    const { form } = createForm({ field: 'name', hidden: true });

    handleApiError({ err: validationError({ name: { code: 'NAME_REQUIRED' } }), form });

    expect(notifications.showModal).toHaveBeenCalledWith(expect.objectContaining({
      title: getErrorMessage({ code: 'NAME_REQUIRED' }),
      text: null
    }));
  });

  it('traduce también el formato de lista de express-validator', () => {
    handleApiError({ err: validationError([{ path: 'supplierId', location: 'body', msg: 'SUPPLIER_ID_INVALID_UUID' }]) });

    expect(notifications.showModal).toHaveBeenCalledWith(expect.objectContaining({
      title: getErrorMessage({ code: 'SUPPLIER_ID_INVALID_UUID' }),
      text: null
    }));
  });

  it('mantiene un aviso para un 400 sin errores de campo', () => {
    const { form } = createForm();

    handleApiError({ err: validationError({}), form });

    expect(notifications.showModal).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Errores de validación.',
      text: null
    }));
  });
});

describe('presentación compartida de errores globales', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.unstubAllGlobals());

  it('traduce un conflicto del servicio sin usar su código como título', () => {
    handleApiError({ err: { status: 409, data: { code: 'RECORD_VERSION_CONFLICT' } } });

    expect(notifications.showModal).toHaveBeenCalledExactlyOnceWith({
      title: getErrorMessage({ code: 'RECORD_VERSION_CONFLICT' }), text: null, icon: 'warning'
    });
  });

  it('usa el mensaje público del servicio si el código aún no tiene traducción local', () => {
    const message = 'Uno o más detalles no pertenecen a la salida de merma.';

    handleApiError({ err: { status: 404, data: { code: 'WASTE_ISSUE_DETAIL_NOT_FOUND', message } } });

    expect(notifications.showModal).toHaveBeenCalledExactlyOnceWith({ title: message, text: null, icon: 'warning' });
  });

  it('conserva el aviso genérico de credenciales sin redirigir ni tratarlo como sesión vencida', () => {
    const replace = vi.fn();
    vi.stubGlobal('window', { location: { replace } });

    handleApiError({ err: { status: 401, requiresAuth: false, data: {
      code: 'LOGIN_ERROR', message: 'Usuario o contraseña incorrectos.'
    } } });

    expect(notifications.showModal).toHaveBeenCalledExactlyOnceWith({
      title: 'Usuario o contraseña incorrectos.', text: null, icon: 'warning'
    });
    expect(replace).not.toHaveBeenCalled();
  });

  it('redirige por sesión vencida y conserva el aviso para la página de acceso', () => {
    const replace = vi.fn();
    const setItem = vi.fn();
    vi.stubGlobal('window', { location: { replace } });
    vi.stubGlobal('localStorage', { setItem });

    handleApiError({ err: { status: 401, data: { code: 'INVALID_AUTH' } } });

    expect(replace).toHaveBeenCalledExactlyOnceWith('/');
    expect(setItem).toHaveBeenCalledExactlyOnceWith('showErrorToast', getErrorMessage({ code: 'INVALID_AUTH' }));
    expect(notifications.showModal).not.toHaveBeenCalled();
  });

  it('presenta el permiso insuficiente con el mismo aviso en cualquier componente', () => {
    handleApiError({ err: { status: 403, data: { code: 'FORBIDDEN' } } });

    expect(showError).toHaveBeenCalledExactlyOnceWith(getErrorMessage({ code: 'FORBIDDEN' }));
    expect(notifications.showModal).not.toHaveBeenCalled();
  });

  it('muestra el mensaje seguro y el código del error de esquema', () => {
    handleApiError({ err: {
      status: 503,
      data: {
        code: 'PRISMA_CLIENT_OUT_OF_SYNC',
        message: 'El cliente de base de datos no está actualizado. Contacta a soporte.'
      }
    } });

    expect(notifications.showModal).toHaveBeenCalledExactlyOnceWith({
      title: 'No se pudo completar la acción',
      text: 'El cliente de base de datos no está actualizado. Contacta a soporte. (Código: PRISMA_CLIENT_OUT_OF_SYNC)',
      icon: 'error'
    });
    expect(showError).not.toHaveBeenCalled();
  });

  it('presenta un 500 en un diálogo con su código en lugar de un toast', () => {
    handleApiError({ err: { status: 500, data: { code: 'SERVER_ERROR' } } });

    expect(notifications.showModal).toHaveBeenCalledExactlyOnceWith({
      title: 'No se pudo completar la acción',
      text: `${getErrorMessage({ code: 'SERVER_ERROR' })} (Código: SERVER_ERROR)`,
      icon: 'error'
    });
    expect(showError).not.toHaveBeenCalled();
  });

  it('muestra el error de parámetro específico al fallar la carga de una tabla', () => {
    handleApiError({ err: { status: 400, data: { code: 'RECORD_ID_INVALID' } } });

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
    expect(notifications.showModal).toHaveBeenCalledExactlyOnceWith({
      title: 'No se pudo completar la acción', text: 'Consulta no disponible', icon: 'error'
    });
  });
});
