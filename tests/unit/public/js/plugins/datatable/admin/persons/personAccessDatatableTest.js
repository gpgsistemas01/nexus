import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({ remove: null, data: null }));
vi.mock('../../../../../../../../src/public/js/plugins/datatable/core/base/createDataTable.js', () => ({
    createDataTable: ({ options }) => { state.data = options.data; }
}));
vi.mock('../../../../../../../../src/public/js/plugins/datatable/core/base/tableOperations.js', () => ({
    refreshDataTable: ({ data }) => { state.data = data; }, resetDataTable: vi.fn()
}));
vi.stubGlobal('$', element => typeof element === 'string'
    ? { on: (_event, _selector, handler) => { state.remove = handler; } }
    : { data: () => element.index });
const { initPersonAccessTable, personAccesses } = await import('../../../../../../../../src/public/js/plugins/datatable/admin/persons/personAccessDatatable.js');

const accesses = [
    { department: { id: 'area-1', name: 'IMPRESIÓN' }, role: { id: 'role-1', name: 'Operador' } },
    { department: { id: 'area-2', name: 'ACABADOS' }, role: { id: 'role-2', name: 'Coordinador' } }
];
beforeEach(() => initPersonAccessTable(accesses));

describe('accesos de la persona conservados al separar la tabla', () => {
    it('carga los accesos existentes con IDs para el formulario y nombres para las filas', () => {
        expect(state.data).toBe(personAccesses);
        expect(personAccesses).toEqual([
            { departmentId: 'area-1', departmentName: 'IMPRESIÓN', roleId: 'role-1', roleName: 'Operador' },
            { departmentId: 'area-2', departmentName: 'ACABADOS', roleId: 'role-2', roleName: 'Coordinador' }
        ]);
    });

    it('quitar un acceso conserva el otro en las filas y en el arreglo que usa el formulario', () => {
        state.remove.call({ index: 0 });
        expect(state.data.map(access => [access.departmentId, access.roleId])).toEqual([['area-2', 'role-2']]);
        expect(personAccesses).toHaveLength(1);
    });

    it('abrir una captura nueva limpia las filas anteriores y permite cargar otra persona', () => {
        initPersonAccessTable();
        expect(state.data).toEqual([]);
        initPersonAccessTable([accesses[1]]);
        expect(personAccesses.map(access => access.departmentId)).toEqual(['area-2']);
    });
});
