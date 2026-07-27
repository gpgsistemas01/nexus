import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { runAfterSelect2Close } from '../../src/public/js/plugins/select2/select2Lifecycle.js';

describe('runAfterSelect2Close', () => {

    let hasClass;
    let select2;

    beforeEach(() => {
        vi.useFakeTimers();
        hasClass = vi.fn();
        select2 = vi.fn();
        vi.stubGlobal('$', vi.fn(() => ({ hasClass, select2 })));
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    it('closes an initialized Select2 before deferring the action', () => {
        const action = vi.fn();
        hasClass.mockReturnValue(true);

        runAfterSelect2Close({ selector: '#productInput', action });

        expect(globalThis.$).toHaveBeenCalledWith('#productInput');
        expect(select2).toHaveBeenCalledWith('close');
        expect(action).not.toHaveBeenCalled();

        vi.runAllTimers();

        expect(action).toHaveBeenCalledOnce();
    });

    it('still defers the action when the select is not initialized', () => {
        const action = vi.fn();
        hasClass.mockReturnValue(false);

        runAfterSelect2Close({ selector: '#productInput', action });

        expect(select2).not.toHaveBeenCalled();
        expect(action).not.toHaveBeenCalled();

        vi.runAllTimers();

        expect(action).toHaveBeenCalledOnce();
    });
});
