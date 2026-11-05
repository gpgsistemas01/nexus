import { defineComponent, h } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useDirectoryEditor } from '../../../../src/modules/directory/composables/useDirectoryEditor.js';
import { directoryService } from '../../../../src/modules/directory/services/directoryService.js';
import { ApiError } from '../../../../src/shared/http/apiError.js';
import { apiClient } from '../../../../src/shared/http/apiClient.js';
import { mockHttpAdapter } from '../../../helpers/httpAdapter.js';
import { clientEntry, supplierEntry } from '../../../fixtures/records.js';
import type {
  DirectoryResource,
  DirectoryTarget,
} from '../../../../src/modules/directory/directory.js';
const adapter = apiClient.http.defaults.adapter;
afterEach(() => {
  vi.restoreAllMocks();
  apiClient.http.defaults.adapter = adapter;
});
const openEditor = (
  resource: DirectoryResource,
  target: DirectoryTarget = { action: 'create' },
) => {
  let editor!: ReturnType<typeof useDirectoryEditor>;
  const saved = vi.fn();
  const denied = vi.fn();
  const request = vi
    .spyOn(directoryService, 'save')
    .mockResolvedValue(resource === 'clients' ? clientEntry : supplierEntry);
  const wrapper = mount(
    defineComponent({
      setup() {
        editor = useDirectoryEditor({ resource, target, onSaved: saved, onDenied: denied });
        return () => h('div');
      },
    }),
  );
  return { editor, saved, denied, request, wrapper };
};
describe('directorio Vue: captura y contratos (DP-VUE-DIR-001)', () => {
  it.each(['clients', 'suppliers'] as const)(
    'abrir %s sin captura no publica errores; enviar sí valida',
    async (resource) => {
      const { editor, request } = openEditor(resource);
      await flushPromises();
      await editor.blur(resource === 'clients' ? 'name' : 'legalName');
      expect(editor.errors.value).toEqual({});
      await editor.submit();
      expect(Object.values(editor.errors.value).length).toBeGreaterThan(0);
      expect(request).not.toHaveBeenCalled();
    },
  );
  it.each([
    ['clients', clientEntry],
    ['suppliers', supplierEntry],
  ] as const)(
    'editar %s envía sólo sus campos y conserva expectedVersion',
    async (resource, row) => {
      const { editor, request } = openEditor(resource, { action: 'edit', row });
      editor.update('isActive', false);
      editor.update('name', ' Nombre nuevo ');
      editor.update('legalName', ' Razón nueva ');
      editor.update('tradeName', ' Comercial nuevo ');
      await editor.submit();
      expect(request).toHaveBeenCalledWith(
        resource,
        { action: 'edit', row },
        {
          ...(resource === 'clients'
            ? { name: 'Nombre nuevo' }
            : { legalName: 'Razón nueva', tradeName: 'Comercial nuevo' }),
          isActive: false,
          expectedVersion: row.version,
        },
        expect.any(AbortSignal),
      );
    },
  );
  it.each([
    ['name', 'clients', 255],
    ['legalName', 'suppliers', 200],
    ['tradeName', 'suppliers', 100],
  ] as const)(
    'frontera de %s: el máximo se admite y máximo + 1 se rechaza',
    async (field, resource, max) => {
      const { editor, request } = openEditor(resource);
      editor.update('name', 'Cliente');
      editor.update('legalName', 'Empresa');
      editor.update('tradeName', 'Comercial');
      editor.update(field, 'A'.repeat(max));
      await editor.submit();
      expect(request).toHaveBeenCalledTimes(1);
      editor.update(field, 'A'.repeat(max + 1));
      await editor.submit();
      expect(request).toHaveBeenCalledTimes(1);
      expect(editor.errors.value[field]).toBeTruthy();
    },
  );
  it('un conflicto conserva la captura y bloquea un nuevo envío de la misma versión', async () => {
    const { editor, request, saved } = openEditor('clients', { action: 'edit', row: clientEntry });
    request.mockRejectedValueOnce(
      new ApiError('El registro cambió', 409, 'RECORD_VERSION_CONFLICT'),
    );
    editor.update('name', 'Mi captura');
    await editor.submit();
    await editor.submit();
    expect(editor.values.name).toBe('Mi captura');
    expect(editor.isConflicted.value).toBe(true);
    expect(request).toHaveBeenCalledTimes(1);
    expect(saved).not.toHaveBeenCalled();
  });
  it('desmontar cancela la escritura y no confirma una respuesta tardía', async () => {
    const { editor, request, saved, wrapper } = openEditor('clients', {
      action: 'edit',
      row: clientEntry,
    });
    let finish!: (entry: typeof clientEntry) => void;
    request.mockImplementationOnce(
      () =>
        new Promise<typeof clientEntry>((resolve) => {
          finish = resolve;
        }),
    );
    const submit = editor.submit();
    await vi.waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    const signal = request.mock.calls[0]![3]!;
    wrapper.unmount();
    expect(signal.aborted).toBe(true);
    finish(clientEntry);
    await submit;
    expect(saved).not.toHaveBeenCalled();
  });
  it('un listado incompleto y una confirmación inesperada se rechazan', async () => {
    apiClient.http.defaults.adapter = mockHttpAdapter(() => ({
      data: { data: [{ ...clientEntry, version: undefined }], recordsFiltered: 1, recordsTotal: 1 },
    }));
    await expect(
      directoryService.list('clients', {
        page: 1,
        length: 10,
        search: '',
        direction: 'asc',
        orderColumn: 0,
      }),
    ).rejects.toThrow('incompleto');
    apiClient.http.defaults.adapter = mockHttpAdapter(() => ({ data: { code: 'SUCCESS' } }));
    await expect(
      directoryService.save('clients', { action: 'create' }, {}, new AbortController().signal),
    ).rejects.toThrow('confirmar');
  });
});

it('un fallo de red conserva la captura y sólo vuelve a enviar tras un reintento explícito', async () => {
  const { editor, request, saved } = openEditor('clients', { action: 'edit', row: clientEntry });
  request.mockRejectedValueOnce(new Error('Sin conexión'));
  editor.update('name', 'Cliente modificado');
  await editor.submit();
  expect(request).toHaveBeenCalledTimes(1);
  expect(saved).not.toHaveBeenCalled();
  expect(editor.values.name).toBe('Cliente modificado');
  expect(editor.message.value).toBe('Sin conexión');
  await editor.submit();
  expect(request).toHaveBeenCalledTimes(2);
  expect(saved).toHaveBeenCalledOnce();
  expect(request.mock.calls[1]![2]).toEqual({
    name: 'Cliente modificado',
    isActive: true,
    expectedVersion: 3,
  });
});
