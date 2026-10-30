import { ref } from 'vue';
import { flushPromises } from '@vue/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import { mountComposable } from '../../../helpers/mountComposable.js';
import { pageOf } from '../../../fixtures/inventory.js';
import { issueFor } from '../../../fixtures/issues.js';
import { useIssueDepartments } from '../../../../src/modules/issues/composables/useIssueDepartments.js';
import { useIssueEditor } from '../../../../src/modules/issues/composables/useIssueEditor.js';
import { useIssueFilters } from '../../../../src/modules/issues/composables/useIssueFilters.js';
import { issueLookupService } from '../../../../src/modules/issues/services/issueLookupService.js';
import { normalizeIssueDocument } from '../../../../src/modules/issues/mappers/issueResponseMapper.js';
import { mapIssueFormToRequest } from '../../../../src/modules/issues/mappers/issueRequestMapper.js';
import type { LookupItem } from '../../../../src/shared/lookup.js';

const printing = { id: 'printing-id', title: 'IMPRESIÓN', data: {} };
const router = { id: 'router-id', title: 'ROUTER', data: {} };
afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

it.each(['materials', 'consumables', 'wastes'] as const)(
  '%s asigna la única área autorizada, carga solicitantes y conserva el ID en el payload',
  async (resource) => {
    const lookup = vi
      .spyOn(issueLookupService, 'list')
      .mockImplementation(async ({ kind }) => pageOf(kind === 'departments' ? [printing] : []));
    const { value, wrapper } = mountComposable(() =>
      useIssueEditor({
        resource,
        target: { mode: 'create' },
        has: () => true,
        onSaved: vi.fn(),
        onDenied: vi.fn(),
      }),
    );
    await flushPromises();
    expect(value.values.departmentId).toBe(printing.id);
    expect(value.headerSelection.departments.isLocked.value).toBe(true);
    expect(value.errors.value).toEqual({});
    expect(
      lookup.mock.calls.some(
        ([query]) =>
          query.kind === 'persons' &&
          query.filters?.department === printing.title &&
          query.filters?.strictDepartmentFilter === 'true',
      ),
    ).toBe(true);
    expect(mapIssueFormToRequest(value.values, resource, 'create').departmentId).toBe(printing.id);
    wrapper.unmount();
  },
);

it.each([
  ['vacío', [], 0],
  ['opción inactiva', [{ ...printing, isDisabled: true }], 1],
  ['varias áreas', [printing, router], 2],
  ['página incompleta', [printing], 2],
] as const)('no asigna ni bloquea el área con %s', async (_label, items, total) => {
  vi.spyOn(issueLookupService, 'list').mockResolvedValue({
    data: [...items],
    recordsTotal: total,
    recordsFiltered: total,
  });
  const selected = ref('');
  const { value, wrapper } = mountComposable(() =>
    useIssueDepartments({
      resource: 'materials',
      isEnabled: () => true,
      getSelectedId: () => selected.value,
      selectDefault: (id) => {
        selected.value = id;
      },
    }),
  );
  await flushPromises();
  expect(selected.value).toBe('');
  expect(value.isLocked.value).toBe(false);
  wrapper.unmount();
});

it('una búsqueda con un solo resultado conserva el selector y el área elegida', async () => {
  vi.useFakeTimers();
  vi.spyOn(issueLookupService, 'list').mockImplementation(async ({ search }) =>
    pageOf(search ? [printing] : [printing, router]),
  );
  const selected = ref(router.id);
  const { value, wrapper } = mountComposable(() =>
    useIssueDepartments({
      resource: 'materials',
      isEnabled: () => true,
      getSelectedId: () => selected.value,
      selectDefault: (id) => {
        selected.value = id;
      },
    }),
  );
  await flushPromises();
  value.updateSearch('IMP');
  await vi.advanceTimersByTimeAsync(300);
  expect(value.items.value).toHaveLength(1);
  expect(value.isLocked.value).toBe(false);
  expect(selected.value).toBe(router.id);
  wrapper.unmount();
});

it.each([printing, router])(
  'editar conserva el área original, solicitante y proyecto aunque el catálogo devuelva $title',
  async (available) => {
    vi.spyOn(issueLookupService, 'list').mockImplementation(async ({ kind }) =>
      pageOf(kind === 'departments' ? [available] : []),
    );
    const original = {
      ...normalizeIssueDocument(issueFor('materials'), 'materials'),
      departmentId: printing.id,
      departmentName: printing.title,
      projectNumber: 'CAP-77',
    };
    const { value, wrapper } = mountComposable(() =>
      useIssueEditor({
        resource: 'materials',
        target: { mode: 'edit', document: original },
        has: () => true,
        onSaved: vi.fn(),
        onDenied: vi.fn(),
      }),
    );
    await flushPromises();
    expect(value.values.departmentId).toBe(original.departmentId);
    expect(value.values.requesterId).toBe(original.requesterId);
    expect(value.values.projectNumber).toBe('CAP-77');
    expect(value.headerSelection.departments.isLocked.value).toBe(available.id === printing.id);
    wrapper.unmount();
  },
);

it('limpiar filtros conserva el área obligatoria y elimina los filtros opcionales', async () => {
  vi.spyOn(issueLookupService, 'list').mockImplementation(async ({ kind }) =>
    pageOf(kind === 'departments' ? [printing] : []),
  );
  const { value, wrapper } = mountComposable(() => useIssueFilters('materials', () => true));
  await flushPromises();
  value.values.clientId = 'client-id';
  value.values.observationsSearch = 'búsqueda';
  value.clear();
  expect(value.values).toMatchObject({
    departmentId: printing.id,
    clientId: '',
    observationsSearch: '',
  });
  expect(value.isDepartmentLocked.value).toBe(true);
  wrapper.unmount();
});

it('un fallo inicial permite reintentar antes de asignar el área', async () => {
  vi.spyOn(issueLookupService, 'list')
    .mockRejectedValueOnce(new Error('Sin conexión'))
    .mockResolvedValueOnce(pageOf([printing]));
  const selected = ref('');
  const { value, wrapper } = mountComposable(() =>
    useIssueDepartments({
      resource: 'materials',
      isEnabled: () => true,
      getSelectedId: () => selected.value,
      selectDefault: (id) => {
        selected.value = id;
      },
    }),
  );
  await flushPromises();
  expect(selected.value).toBe('');
  expect(value.isLocked.value).toBe(false);
  expect(value.error.value).toBe('Sin conexión');
  await value.retry();
  await flushPromises();
  expect(selected.value).toBe(printing.id);
  expect(value.isLocked.value).toBe(true);
  wrapper.unmount();
});

it('una respuesta cancelada al cerrar no cambia el bloqueo de la instancia anterior', async () => {
  let resolve!: (result: ReturnType<typeof pageOf<LookupItem>>) => void;
  vi.spyOn(issueLookupService, 'list').mockImplementation(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  const { value, wrapper } = mountComposable(() =>
    useIssueDepartments({
      resource: 'materials',
      isEnabled: () => true,
      getSelectedId: () => printing.id,
      selectDefault: vi.fn(),
    }),
  );
  wrapper.unmount();
  resolve(pageOf([printing]));
  await flushPromises();
  expect(value.isLocked.value).toBe(false);
});
