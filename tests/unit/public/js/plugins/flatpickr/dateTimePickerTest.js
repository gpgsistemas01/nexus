import { afterEach, describe, expect, it, vi } from 'vitest';

import { initMonthPickers, setMonthPickerDisabled } from '../../../../../../src/public/js/plugins/flatpickr/dateTimePicker.js';

describe('selector mensual Flatpickr para reportes', () => {
    afterEach(() => vi.unstubAllGlobals());

    it('inicializa el plugin mensual con el formato contractual', () => {
        const input = { disabled: true };
        const altInput = { disabled: false, classList: { toggle: vi.fn() } };
        const instance = { input, altInput };
        const monthSelectPlugin = vi.fn(options => ({ options }));
        const flatpickr = vi.fn(() => instance);
        flatpickr.l10ns = { es: { firstDayOfWeek: 1 } };
        const root = { querySelectorAll: vi.fn(() => [input]) };

        vi.stubGlobal('window', { flatpickr, monthSelectPlugin });

        expect(initMonthPickers(root)).toEqual([instance]);
        expect(monthSelectPlugin).toHaveBeenCalledWith({
            altFormat: 'F Y',
            dateFormat: 'Y-m',
            shorthand: false
        });
        expect(flatpickr).toHaveBeenCalledWith(input, expect.objectContaining({
            altFormat: 'F Y',
            dateFormat: 'Y-m',
            plugins: [expect.any(Object)]
        }));
        expect(altInput.disabled).toBe(true);
    });

    it('sincroniza el estado deshabilitado del input visible y del original', () => {
        const altInput = { disabled: true, classList: { toggle: vi.fn() } };
        const input = { disabled: true, _flatpickr: { altInput } };
        input._flatpickr.input = input;

        setMonthPickerDisabled(input, false);

        expect(input.disabled).toBe(false);
        expect(altInput.disabled).toBe(false);
        expect(altInput.classList.toggle).toHaveBeenCalledWith('disabled', false);
    });
});
