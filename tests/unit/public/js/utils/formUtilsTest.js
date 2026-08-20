import { afterEach, describe, expect, it, vi } from 'vitest';

import { SELECT2_EVENT_NAMES } from '../../../../../src/public/js/constants/events.js';
import { toggleDisabledElement } from '../../../../../src/public/js/utils/formUtils.js';

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('toggleDisabledElement en controles reutilizados por los CRUD', () => {
    it('deshabilita un Select2 y notifica el cambio con el evento compartido', () => {
        const select2Container = { toggleClass: vi.fn() };
        const select2 = {
            prop: vi.fn(),
            trigger: vi.fn(),
            next: vi.fn(() => select2Container)
        };
        select2.prop.mockReturnValue(select2);
        select2.trigger.mockReturnValue(select2);
        const element = {
            classList: { toggle: vi.fn() },
            disabled: false,
            matches: vi.fn(() => true)
        };
        const $ = vi.fn(() => ({
            ...select2,
            hasClass: vi.fn(() => true)
        }));
        vi.stubGlobal('window', { $ });

        toggleDisabledElement({ element, isDisabled: true });

        expect(element.disabled).toBe(true);
        expect(select2.prop).toHaveBeenCalledWith('disabled', true);
        expect(select2.trigger).toHaveBeenCalledWith(SELECT2_EVENT_NAMES.CHANGE);
        expect(select2Container.toggleClass).toHaveBeenCalledWith('disabled', true);
    });
});
