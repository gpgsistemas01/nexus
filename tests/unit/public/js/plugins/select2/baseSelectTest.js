import { describe, expect, it, vi } from 'vitest';
import { SELECT2_EVENT_NAMES } from '../../../../../../src/public/js/constants/events.js';

vi.mock('../../../../../../src/public/js/ui/disabledControlWarning.js', () => ({
    bindDisabledControlWarning: vi.fn(),
    setDisabledControlWarning: vi.fn()
}));

import {
    buildPaginatedSelectParams,
    buildPaginatedSelectResults,
    runAfterSelect2Close,
    SELECT2_CLOSE_SETTLE_DELAY_MS,
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

describe('apertura de modales desde Select2', () => {
    it('espera a que Select2 termine su ciclo de cierre antes de abrir el modal', () => {
        vi.useFakeTimers();
        const action = vi.fn();
        const previousDollar = globalThis.$;

        globalThis.$ = vi.fn(() => ({
            hasClass: () => false
        }));

        try {
            runAfterSelect2Close({ selector: '#supplierSelect', action });

            vi.advanceTimersByTime(SELECT2_CLOSE_SETTLE_DELAY_MS - 1);
            expect(action).not.toHaveBeenCalled();

            vi.advanceTimersByTime(1);
            expect(action).toHaveBeenCalledOnce();
        } finally {
            globalThis.$ = previousDollar;
            vi.useRealTimers();
        }
    });

    it('inicia la espera después de recibir el cierre real del desplegable', () => {
        vi.useFakeTimers();
        const action = vi.fn();
        const previousDollar = globalThis.$;
        let closeHandler;
        const $select = {
            hasClass: () => true,
            data: () => ({ isOpen: () => true }),
            one: vi.fn((eventName, handler) => {
                closeHandler = handler;
            }),
            select2: vi.fn(() => closeHandler())
        };

        globalThis.$ = vi.fn(() => $select);

        try {
            runAfterSelect2Close({ selector: '#supplierSelect', action });

            expect($select.one).toHaveBeenCalledWith(SELECT2_EVENT_NAMES.CLOSE, expect.any(Function));
            expect($select.select2).toHaveBeenCalledWith('close');
            expect(action).not.toHaveBeenCalled();

            vi.advanceTimersByTime(SELECT2_CLOSE_SETTLE_DELAY_MS);
            expect(action).toHaveBeenCalledOnce();
        } finally {
            globalThis.$ = previousDollar;
            vi.useRealTimers();
        }
    });
});
