import { describe, expect, it } from 'vitest';
import {
    DOM_EVENT_NAMES,
    MODAL_EVENT_NAMES,
    SELECT2_EVENT_NAMES
} from '../../../../../src/public/js/constants/events.js';

describe('eventos compartidos de los CRUD', () => {
    it('distingue eventos DOM, Select2 y de modal por integración', () => {
        expect(DOM_EVENT_NAMES).toMatchObject({
            CLICK: 'click',
            CHANGE: 'change',
            INPUT: 'input',
            SUBMIT: 'submit'
        });
        expect(SELECT2_EVENT_NAMES).toMatchObject({
            SELECT: 'select2:select',
            CLEAR: 'select2:clear',
            CHANGE: 'change.select2'
        });
        expect(MODAL_EVENT_NAMES).toMatchObject({
            MDB_SHOWN: 'shown.mdb.modal',
            BOOTSTRAP_SHOWN: 'shown.bs.modal'
        });
    });
});
