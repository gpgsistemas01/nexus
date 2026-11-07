import { describe, expect, it } from 'vitest';

import { mergeMainTableColumnDefs } from '../../../../../../../src/public/js/plugins/datatable/core/responsive/columnDefs.js';

describe('mergeMainTableColumnDefs', () => {
    it('prioriza el identificador y las acciones en la tabla principal responsive', () => {
        expect(mergeMainTableColumnDefs('#table')).toEqual(expect.arrayContaining([
            { targets: 0, responsivePriority: 1 },
            { targets: -1, responsivePriority: 2 }
        ]));
    });

    it('no impone prioridades de la tabla principal a tablas secundarias', () => {
        const columnDefs = [{ targets: 0, visible: false }];

        expect(mergeMainTableColumnDefs('#materialTable', columnDefs)).toBe(columnDefs);
    });
});
