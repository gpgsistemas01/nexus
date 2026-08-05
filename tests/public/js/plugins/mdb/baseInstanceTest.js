import { afterEach, describe, expect, it, vi } from 'vitest';
import { initMdbNavAccordions } from '../../../../../src/public/js/plugins/mdb/baseInstance.js';

describe('initMdbNavAccordions', () => {
    afterEach(() => {
        delete globalThis.mdb;
    });

    it('initializes every navigation submenu without toggling it on page load', () => {
        const submenus = [{ id: 'warehouse' }, { id: 'issues' }];
        const root = {
            querySelectorAll: vi.fn().mockReturnValue(submenus)
        };
        const getOrCreateInstance = vi.fn();
        globalThis.mdb = { Collapse: { getOrCreateInstance } };

        initMdbNavAccordions(root);

        expect(root.querySelectorAll).toHaveBeenCalledWith('.app-nav-accordion .app-nav-submenu');
        expect(getOrCreateInstance).toHaveBeenCalledTimes(2);
        expect(getOrCreateInstance).toHaveBeenNthCalledWith(1, submenus[0], { toggle: false });
        expect(getOrCreateInstance).toHaveBeenNthCalledWith(2, submenus[1], { toggle: false });
    });

    it('does nothing when the MDB Collapse component is unavailable', () => {
        const root = { querySelectorAll: vi.fn() };

        initMdbNavAccordions(root);

        expect(root.querySelectorAll).not.toHaveBeenCalled();
    });
});
