import { afterEach, describe, expect, it, vi } from 'vitest';

import { clearAddedItemInput, clearAddedMaterialInput } from '../../../../../../src/public/js/ui/forms/detailFormUI.js';

const setupDetailInputs = () => {
    const createInput = value => {
        const classes = new Set(['active']);

        return {
            value,
            closest: vi.fn(() => ({})),
            classList: {
                contains: className => classes.has(className),
                toggle: (className, force) => force ? classes.add(className) : classes.delete(className)
            }
        };
    };
    const item = {
        value: 'selected-item',
        replaceChildren: vi.fn(),
        dispatchEvent: vi.fn()
    };
    const quantity = createInput('5');
    const presentation = createInput('Caja');
    const cost = createInput('20');
    const inputs = {
        '#item': item,
        '#materialInput': item,
        '#quantity': quantity,
        '#quantityInput': quantity,
        '#presentation': presentation,
        '#presentationDisplayInput': presentation,
        '#cost': cost,
        '#costPerUnitInput': cost
    };
    const update = vi.fn();

    vi.stubGlobal('document', { querySelector: vi.fn(selector => inputs[selector]) });
    vi.stubGlobal('window', {
        mdb: { Input: { getOrCreateInstance: vi.fn(() => ({ update })) } }
    });

    return { item, quantity, presentation, cost, update };
};

describe('limpieza del formulario al agregar un detalle CRUD', () => {
    afterEach(() => vi.unstubAllGlobals());

    it('restaura los wrappers de cantidad y presentación después de agregar una merma', () => {
        const { item, quantity, presentation, cost, update } = setupDetailInputs();

        clearAddedItemInput({
            itemSelector: '#item',
            quantitySelector: '#quantity',
            presentationSelector: '#presentation'
        });

        expect(item.value).toBe('');
        expect(item.dispatchEvent).toHaveBeenCalledOnce();
        expect(quantity.value).toBe('');
        expect(quantity.classList.contains('active')).toBe(false);
        expect(presentation.value).toBe('');
        expect(presentation.classList.contains('active')).toBe(false);
        expect(cost.value).toBe('20');
        expect(update).toHaveBeenCalledTimes(2);
    });

    it('restaura también el wrapper de costo después de agregar un material', () => {
        const { item, quantity, presentation, cost, update } = setupDetailInputs();

        clearAddedMaterialInput();

        expect(item.replaceChildren).toHaveBeenCalledOnce();
        expect(quantity.classList.contains('active')).toBe(false);
        expect(presentation.classList.contains('active')).toBe(false);
        expect(cost.value).toBe('');
        expect(cost.classList.contains('active')).toBe(false);
        expect(update).toHaveBeenCalledTimes(3);
    });
});
