import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../../../../src/public/js/ui/disabledControlWarning.js', () => ({
    bindDisabledControlWarning: vi.fn(),
    setDisabledControlWarning: vi.fn()
}));

import {
    buildPaginatedSelectParams,
    buildPaginatedSelectResults,
    SELECT_RESULTS_LIMIT
} from '../../../../../../src/public/js/plugins/select2/baseSelect.js';

describe('baseSelect paginated CRUD lists', () => {
    it('translates the Select2 page into the standard list endpoint paging parameters', () => {
        expect(buildPaginatedSelectParams({ page: 3, term: 'cartón' })).toEqual({
            search: 'cartón',
            start: SELECT_RESULTS_LIMIT * 2,
            length: SELECT_RESULTS_LIMIT
        });
    });

    it('keeps requesting pages while the filtered CRUD result has more options', () => {
        const response = {
            data: Array.from({ length: SELECT_RESULTS_LIMIT }, (_, index) => ({
                id: index + 1,
                name: `Opción ${ index + 1 }`
            })),
            recordsFiltered: SELECT_RESULTS_LIMIT + 1
        };

        expect(buildPaginatedSelectResults(response, { page: 1 }, {
            mapItem: ({ id, name }) => ({ id, text: name })
        })).toMatchObject({
            results: expect.arrayContaining([
                { id: 1, text: 'Opción 1' }
            ]),
            pagination: { more: true }
        });
    });

    it('stops pagination after loading the last page of the CRUD result', () => {
        expect(buildPaginatedSelectResults({ data: [], recordsFiltered: 20 }, { page: 2 }))
            .toEqual({ results: [], pagination: { more: false } });
    });
});
