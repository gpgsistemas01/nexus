import { describe, expect, it } from 'vitest';

import { normalizeColumns } from '../../../../../../../src/public/js/plugins/datatable/core/base/columnOptions.js';

describe('normalizeColumns', () => {
    it('mantiene visible la columna de acciones mediante su clase compartida', () => {
        const [column] = normalizeColumns([{
            title: 'Acciones',
            className: 'text-center'
        }]);

        expect(column).toEqual(expect.objectContaining({
            className: 'text-center datatable-action-column',
            orderable: false,
            searchable: false
        }));
    });

    it('no aplica el comportamiento fijo a columnas de datos', () => {
        const [column] = normalizeColumns([{ title: 'Proveedor' }]);

        expect(column.className).toBeUndefined();
    });
});
