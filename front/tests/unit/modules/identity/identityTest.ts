import { flushPromises } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePersonEditor } from '../../../../src/modules/identity/composables/usePersonEditor.js';
import { useUserEditor } from '../../../../src/modules/identity/composables/useUserEditor.js';
import { identityService } from '../../../../src/modules/identity/services/identityService.js';
import { organizationService } from '../../../../src/shared/services/organizationService.js';
import { ApiError } from '../../../../src/shared/http/apiError.js';
import { apiClient } from '../../../../src/shared/http/apiClient.js';
import { mockHttpAdapter } from '../../../helpers/httpAdapter.js';
import { mountComposable } from '../../../helpers/mountComposable.js';
import {
  accountEntry,
  personEntry,
  recordIds,
  departments,
  roles,
  recordPermissions,
  personData,
  accountData,
} from '../../../fixtures/records.js';
import { pageOf } from '../../../fixtures/inventory.js';
const adapter = apiClient.http.defaults.adapter;
beforeEach(() => {
  vi.spyOn(organizationService, 'options').mockImplementation(async ({ resource }) =>
    pageOf(
      (resource === 'departments' ? departments : roles).map((row) => ({
        id: row.id,
        title: row.name,
        data: row,
      })),
    ),
  );
});
afterEach(() => {
  vi.restoreAllMocks();
  apiClient.http.defaults.adapter = adapter;
});
const callbacks = () => ({ onSaved: vi.fn(), onDenied: vi.fn(), permissions: recordPermissions });

it.each(['departments', 'roles'] as const)(
  'las opciones de %s conservan paginación, búsqueda y señal',
  async (resource) => {
    vi.mocked(organizationService.options).mockRestore();
    const requestSignal = new AbortController().signal;
    apiClient.http.defaults.adapter = mockHttpAdapter((config) => {
      const url = new URL(config.url!, 'http://test');
      expect(url.pathname).toBe(`/api/admin/${resource}`);
      expect(url.searchParams.get('search')).toBe('Coordinación');
      expect(url.searchParams.get('start')).toBe('20');
      expect(url.searchParams.get('length')).toBe('20');
      expect(config.signal).toBe(requestSignal);
      return { data: pageOf([]) };
    });
    const result = await organizationService.options(
      { resource, search: 'Coordinación', page: 2 },
      requestSignal,
    );
    expect(result.data).toEqual([]);
  },
);

describe('personas Vue: responsabilidades independientes de cuentas (DP-VUE-IDA-001)', () => {
  it('el alta exige nombre y asignación, y abrir no muestra errores sin captura', async () => {
    const request = vi.spyOn(identityService, 'save').mockResolvedValue(undefined);
    const { value: editor } = mountComposable(() =>
      usePersonEditor({ target: { action: 'create' }, ...callbacks() }),
    );
    await flushPromises();
    await editor.blur('fullName');
    expect(editor.errors.value).toEqual({});
    await editor.submit();
    expect(editor.errors.value.fullName).toBeTruthy();
    expect(editor.errors.value.accesses).toBeTruthy();
    expect(request).not.toHaveBeenCalled();
  });
  it('agregar rechaza área duplicada y editar conserva las otras responsabilidades y la versión original', async () => {
    const request = vi.spyOn(identityService, 'save').mockResolvedValue(undefined);
    const { value: editor } = mountComposable(() =>
      usePersonEditor({ target: { action: 'edit', row: personEntry }, ...callbacks() }),
    );
    await flushPromises();
    editor.departmentId.value = recordIds.department;
    editor.roleId.value = recordIds.secondRole;
    await editor.addAccess();
    expect(editor.accessError.value).toContain('ya está');
    expect(editor.values.accesses).toHaveLength(2);
    editor.update('fullName', ' Ana Actualizada ');
    await editor.submit();
    expect(request).toHaveBeenCalledWith(
      'persons',
      { action: 'edit', row: personEntry },
      {
        fullName: 'Ana Actualizada',
        expectedVersion: 4,
        accesses: personEntry.accesses.map(({ departmentId, roleId }) => ({
          departmentId,
          roleId,
        })),
      },
      expect.any(AbortSignal),
    );
  });
  it('quitar la última responsabilidad valida la captura e impide guardarla vacía', async () => {
    const request = vi.spyOn(identityService, 'save').mockResolvedValue(undefined);
    const { value: editor } = mountComposable(() =>
      usePersonEditor({ target: { action: 'edit', row: personEntry }, ...callbacks() }),
    );
    await editor.removeAccess(recordIds.department);
    await editor.removeAccess(recordIds.secondDepartment);
    await editor.submit();
    expect(editor.errors.value.accesses).toBeTruthy();
    expect(request).not.toHaveBeenCalled();
  });
  it('buscar más opciones conserva la asignación elegida antes de agregarla', async () => {
    const { value: editor } = mountComposable(() =>
      usePersonEditor({ target: { action: 'create' }, ...callbacks() }),
    );
    await flushPromises();
    editor.departmentId.value = recordIds.department;
    editor.roleId.value = recordIds.role;
    await flushPromises();
    vi.mocked(organizationService.options).mockResolvedValue(pageOf([]));
    editor.organization.departments.updateSearch('otra área');
    editor.organization.roles.updateSearch('otro rol');
    await vi.waitFor(() => {
      expect(editor.organization.departments.items.value).toEqual([]);
      expect(editor.organization.roles.items.value).toEqual([]);
    });
    await editor.addAccess();
    expect(editor.accessError.value).toBe('');
    expect(editor.values.accesses).toEqual([
      {
        departmentId: recordIds.department,
        roleId: recordIds.role,
        departmentName: 'ALMACÉN',
        roleName: 'COORDINADOR',
      },
    ]);
  });
});

describe('usuarios Vue: cuentas y credenciales versionadas (DP-VUE-IDA-002)', () => {
  it('crear envía una contraseña válida y la asignación única de cuenta', async () => {
    const request = vi.spyOn(identityService, 'save').mockResolvedValue(undefined);
    const { value: editor } = mountComposable(() =>
      useUserEditor({ target: { action: 'create' }, ...callbacks() }),
    );
    editor.update('name', ' nuevo ');
    editor.update('password', 'ClaveNueva2026!');
    editor.update('departmentId', recordIds.department);
    editor.update('roleId', recordIds.role);
    await editor.submit();
    expect(request).toHaveBeenCalledWith(
      'users',
      { action: 'create' },
      {
        name: 'nuevo',
        password: 'ClaveNueva2026!',
        departmentId: recordIds.department,
        roleId: recordIds.role,
      },
      expect.any(AbortSignal),
    );
  });
  it('editar conserva la vinculación: omite contraseña y personId del payload', async () => {
    const request = vi.spyOn(identityService, 'save').mockResolvedValue(undefined);
    const { value: editor } = mountComposable(() =>
      useUserEditor({ target: { action: 'edit', row: accountEntry }, ...callbacks() }),
    );
    editor.update('name', 'ana2');
    await editor.submit();
    expect(request).toHaveBeenCalledWith(
      'users',
      { action: 'edit', row: accountEntry },
      {
        name: 'ana2',
        departmentId: recordIds.department,
        roleId: recordIds.role,
        expectedVersion: 7,
      },
      expect.any(AbortSignal),
    );
  });
  it('cambiar contraseña sólo envía la clave y la versión, sin consultar opciones organizacionales', async () => {
    const request = vi.spyOn(identityService, 'save').mockResolvedValue(undefined);
    const { value: editor } = mountComposable(() =>
      useUserEditor({ target: { action: 'password', row: accountEntry }, ...callbacks() }),
    );
    await editor.blur('password');
    expect(editor.errors.value).toEqual({});
    editor.update('password', 'ClaveNueva2026!');
    await editor.submit();
    expect(request).toHaveBeenCalledWith(
      'users',
      { action: 'password', row: accountEntry },
      { password: 'ClaveNueva2026!', expectedVersion: 7 },
      expect.any(AbortSignal),
    );
    expect(organizationService.options).not.toHaveBeenCalled();
  });
  it.each([401, 403])(
    'un rechazo %s conserva la captura y comunica el acceso denegado',
    async (status) => {
      vi.spyOn(identityService, 'save').mockRejectedValue(new ApiError('Acceso rechazado', status));
      const hooks = callbacks();
      const { value: editor } = mountComposable(() =>
        useUserEditor({ target: { action: 'password', row: accountEntry }, ...hooks }),
      );
      editor.update('password', 'ClaveNueva2026!');
      await editor.submit();
      expect(hooks.onDenied).toHaveBeenCalledWith(status);
      expect(hooks.onSaved).not.toHaveBeenCalled();
    },
  );
  it('un envío pendiente bloquea duplicados y un conflicto impide reutilizar la versión', async () => {
    let reject!: (reason: unknown) => void;
    const request = vi.spyOn(identityService, 'save').mockImplementation(
      () =>
        new Promise((_, fail) => {
          reject = fail;
        }),
    );
    const { value: editor } = mountComposable(() =>
      useUserEditor({ target: { action: 'password', row: accountEntry }, ...callbacks() }),
    );
    editor.update('password', 'ClaveNueva2026!');
    const pending = editor.submit();
    await vi.waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    await editor.submit();
    expect(request).toHaveBeenCalledTimes(1);
    reject(new ApiError('Cambió', 409, 'RECORD_VERSION_CONFLICT'));
    await pending;
    await editor.submit();
    expect(editor.isConflicted.value).toBe(true);
    expect(request).toHaveBeenCalledTimes(1);
  });
});

it.each([
  ['persons', personData],
  ['users', { ...accountData, password: 'NUNCA-MOSTRAR' }],
] as const)(
  'el listado %s conserva datos y versión sin exponer claves de credenciales',
  async (resource, row) => {
    apiClient.http.defaults.adapter = mockHttpAdapter((config) => {
      const url = new URL(config.url!, 'http://front.test');
      expect(url.pathname).toBe(`/api/admin/${resource}`);
      if (resource === 'persons') expect(url.searchParams.get('includeAccesses')).toBe('true');
      return { data: pageOf([row]) };
    });
    const result = await identityService.list(resource, {
      page: 1,
      length: 10,
      search: '',
      direction: 'asc',
      orderColumn: 0,
      department: '',
      role: '',
    });
    expect(result.data[0]?.version).toBe(row.version);
    expect(result.data[0]).not.toHaveProperty('password');
    if (resource === 'persons') expect(result.data[0]?.accesses).toHaveLength(2);
  },
);

it('las mutaciones de contraseña usan PATCH y su endpoint específico', async () => {
  apiClient.http.defaults.adapter = mockHttpAdapter((config) => {
    expect(config.method).toBe('patch');
    expect(config.url).toBe(`/api/admin/users/${accountEntry.id}/password`);
    expect(JSON.parse(config.data)).toEqual({ password: 'NuevaClave2026!', expectedVersion: 7 });
    return { data: { code: 'UPDATED_USER_PASSWORD' } };
  });
  await identityService.save(
    'users',
    { action: 'password', row: accountEntry },
    { password: 'NuevaClave2026!', expectedVersion: 7 },
    new AbortController().signal,
  );
});

it('el reporte de personas rechaza un filtro de rol que la API de exportación no admite', async () => {
  const request = vi.spyOn(apiClient, 'request');
  await expect(
    identityService.export(
      'persons',
      {
        page: 1,
        length: 10,
        search: '',
        direction: 'asc',
        orderColumn: 0,
        department: '',
        role: 'COORDINADOR',
      },
      new AbortController().signal,
    ),
  ).rejects.toThrow('filtro de rol');
  expect(request).not.toHaveBeenCalled();
});
