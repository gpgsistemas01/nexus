import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../../../../../../src/public/js/plugins/swal/swalComponent.js', () => ({
  notifications: {
    showError: vi.fn(),
    showModal: vi.fn(),
    showWarning: vi.fn()
  }
}));

const { notifications } = await import('../../../../../../../../src/public/js/plugins/swal/swalComponent.js');
const { createDataTable } = await import('../../../../../../../../src/public/js/plugins/datatable/core/base/createDataTable.js');

const createRemoteTable = get => {
  let options;
  vi.stubGlobal('$', () => ({ DataTable: value => { options = value; } }));
  createDataTable({ options: { ajax: { get }, columns: [] } });
  return options.ajax;
};

const request = { draw: 1, start: 0, length: 10 };
const payload = { data: [{ id: 'current-record' }], recordsTotal: 1, recordsFiltered: 1 };

describe('recuperación de lecturas del DataTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('entrega una consulta correcta sin repetirla ni mostrar avisos', async () => {
    const get = vi.fn().mockResolvedValue({ data: payload });
    const load = createRemoteTable(get);
    const callback = vi.fn();

    await load(request, callback);

    expect(get).toHaveBeenCalledExactlyOnceWith(request);
    expect(callback).toHaveBeenCalledExactlyOnceWith(payload);
    expect(notifications.showModal).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([0, 408, 502, 503, 504])('recupera un fallo transitorio %s con un solo reintento', async status => {
    const get = vi.fn().mockRejectedValueOnce({ status }).mockResolvedValue({ data: payload });
    const load = createRemoteTable(get);
    const callback = vi.fn();

    const pending = load(request, callback);
    await vi.advanceTimersByTimeAsync(499);

    expect(get).toHaveBeenCalledTimes(1);
    expect(callback).not.toHaveBeenCalled();
    expect(notifications.showModal).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    await pending;

    expect(get.mock.calls).toEqual([[request], [request]]);
    expect(callback).toHaveBeenCalledExactlyOnceWith(payload);
    expect(notifications.showModal).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([400, 403, 404, 409, 429, 500])('no repite una consulta rechazada con HTTP %s', async status => {
    const get = vi.fn().mockRejectedValue({ status, message: 'Consulta rechazada.' });
    const callback = vi.fn();

    await createRemoteTable(get)(request, callback);

    expect(get).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledExactlyOnceWith({ draw: 1, data: [], recordsTotal: 0, recordsFiltered: 0 });
    expect(vi.getTimerCount()).toBe(0);
    if (status === 500) {
      expect(notifications.showModal).toHaveBeenCalledExactlyOnceWith({
        title: 'No se pudo completar la acción',
        text: 'Consulta rechazada.',
        icon: 'error'
      });
    }
  });

  it.each(['DATABASE_TABLE_MISSING', 'SERVICE_UNAVAILABLE'])(
    'un fallo 503 con código %s conserva el mismo límite de reintentos y el aviso definitivo', async code => {
      const get = vi.fn().mockRejectedValue({ status: 503, data: { code } });
      const callback = vi.fn();

      const pending = createRemoteTable(get)(request, callback);
      await vi.runAllTimersAsync();
      await pending;

      expect(get).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenCalledTimes(1);
      expect(notifications.showModal).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({
        text: expect.stringContaining(code),
        icon: 'error'
      }));
      expect(vi.getTimerCount()).toBe(0);
    }
  );

  it('detiene los fallos persistentes tras el segundo intento y permite otra carga posterior', async () => {
    const get = vi.fn().mockRejectedValue({ status: 0, message: 'Sin conexión.' });
    const load = createRemoteTable(get);
    const callback = vi.fn();

    const pending = load(request, callback);
    await vi.runAllTimersAsync();
    await pending;

    expect(get).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenCalledExactlyOnceWith({ draw: 1, data: [], recordsTotal: 0, recordsFiltered: 0 });
    expect(notifications.showModal).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);

    get.mockResolvedValue({ data: payload });
    await load({ ...request, draw: 2 }, callback);

    expect(get).toHaveBeenCalledTimes(3);
    expect(callback).toHaveBeenLastCalledWith(payload);
    expect(notifications.showModal).toHaveBeenCalledTimes(1);
  });

  it('omite el reintento anterior si los filtros ya iniciaron otra consulta', async () => {
    const get = vi.fn().mockRejectedValueOnce({ status: 503 }).mockResolvedValue({ data: payload });
    const load = createRemoteTable(get);
    const staleCallback = vi.fn();
    const callback = vi.fn();

    const stale = load(request, staleCallback);
    await vi.advanceTimersByTimeAsync(0);
    const currentRequest = { ...request, draw: 2, search: { value: 'nuevo filtro' } };
    await load(currentRequest, callback);
    await vi.runAllTimersAsync();
    await stale;

    expect(get.mock.calls).toEqual([[request], [currentRequest]]);
    expect(staleCallback).not.toHaveBeenCalled();
    expect(callback).toHaveBeenCalledExactlyOnceWith(payload);
    expect(notifications.showModal).not.toHaveBeenCalled();
  });

  it.each(['response', 'error'])('ignora un %s tardío de una consulta reemplazada', async result => {
    let resolveOld;
    let rejectOld;
    const oldResponse = new Promise((resolve, reject) => { resolveOld = resolve; rejectOld = reject; });
    const get = vi.fn().mockReturnValueOnce(oldResponse).mockResolvedValue({ data: payload });
    const load = createRemoteTable(get);
    const staleCallback = vi.fn();
    const callback = vi.fn();

    const stale = load(request, staleCallback);
    await load({ ...request, draw: 2 }, callback);
    if (result === 'response') resolveOld({ data: { data: [{ id: 'old-record' }] } });
    else rejectOld({ status: 500 });
    await stale;

    expect(staleCallback).not.toHaveBeenCalled();
    expect(callback).toHaveBeenCalledExactlyOnceWith(payload);
    expect(notifications.showModal).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('no vuelve a consultar ni presenta avisos si la tabla se destruyó durante la espera', async () => {
    const get = vi.fn().mockRejectedValue({ status: 503 });
    const callback = vi.fn();
    const settings = { bDestroying: false };

    const pending = createRemoteTable(get)(request, callback, settings);
    await vi.advanceTimersByTimeAsync(0);
    settings.bDestroying = true;
    await vi.runAllTimersAsync();
    await pending;

    expect(get).toHaveBeenCalledTimes(1);
    expect(callback).not.toHaveBeenCalled();
    expect(notifications.showModal).not.toHaveBeenCalled();
  });

  it('no repite la consulta si falla el procesamiento de una respuesta correcta', async () => {
    const get = vi.fn().mockResolvedValue({ data: payload });
    const error = new Error('Fallo al renderizar');
    const callback = vi.fn(() => { throw error; });

    await expect(createRemoteTable(get)(request, callback)).rejects.toBe(error);

    expect(get).toHaveBeenCalledTimes(1);
    expect(notifications.showModal).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('conserva las tablas de detalle locales sin consultas remotas', () => {
    let options;
    vi.stubGlobal('$', () => ({ DataTable: value => { options = value; } }));

    createDataTable({ options: { data: payload.data, columns: [] } });

    expect(options.ajax).toBeUndefined();
    expect(options.data).toEqual(payload.data);
    expect(options.serverSide).toBe(false);
  });
});
