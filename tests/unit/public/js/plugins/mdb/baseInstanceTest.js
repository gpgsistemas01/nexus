import { afterEach, describe, expect, it, vi } from 'vitest';

import { setMdbWrapperInputValue } from '../../../../../../src/public/js/plugins/mdb/baseInstance.js';

const setupInput = ({ value = '', isActive = false } = {}) => {
    const wrapper = {};
    const classes = new Set(isActive ? ['active'] : []);
    const input = {
        value,
        closest: vi.fn(() => wrapper),
        classList: {
            contains: className => classes.has(className),
            toggle: (className, force) => force ? classes.add(className) : classes.delete(className)
        }
    };
    const update = vi.fn();

    vi.stubGlobal('document', { querySelector: vi.fn(() => input) });
    vi.stubGlobal('window', {
        mdb: { Input: { getOrCreateInstance: vi.fn(() => ({ update })) } }
    });

    return { input, update };
};

describe('wrapper de inputs derivados en formularios CRUD', () => {
    afterEach(() => vi.unstubAllGlobals());

    it.each([
        ['text', 'Presentación seleccionada'],
        ['number', 25]
    ])('activa el wrapper de un input %s cuando recibe un valor derivado', (_, value) => {
        const { input, update } = setupInput();

        setMdbWrapperInputValue({ selector: '#dependentInput', value });

        expect(input.value).toBe(value);
        expect(input.classList.contains('active')).toBe(true);
        expect(update).toHaveBeenCalledOnce();
    });

    it.each(['text', 'number'])('restaura el wrapper de un input %s cuando el select queda vacío', () => {
        const { input, update } = setupInput({ value: 'valor anterior', isActive: true });

        setMdbWrapperInputValue({ selector: '#dependentInput', value: '' });

        expect(input.value).toBe('');
        expect(input.classList.contains('active')).toBe(false);
        expect(update).toHaveBeenCalledOnce();
    });
});
