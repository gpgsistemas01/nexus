import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../../../../../src/public/js/ui/inventory/inventoryCrudModalUI.js', () => ({ initializeInventoryCrudModal: vi.fn() }));
vi.mock('../../../../../../../src/public/js/ui/modalUI.js', () => ({ openModal: vi.fn() }));
const elements = Object.fromEntries([
    '#wasteStockAdditionName', '#wasteStockAdditionCurrentStock',
    '#wasteStockAdditionResultingStock', '#wasteStockAdditionQuantityInput', '#wasteStockAdditionModal'
].map(selector => [selector, {}]));
const form = { elements: { observations: {} }, querySelector: () => ({}) };
vi.stubGlobal('document', { querySelector: selector => selector === '#wasteStockAdditionForm' ? form : elements[selector] });
const { openWasteStockAdditionModal } = await import('../../../../../../../src/public/js/pages/warehouse/wastes/wasteStockAdditionModal.js');
const { formatDecimal } = await import('../../../../../../../src/public/js/utils/formatUtils.js');

beforeEach(() => { elements['#wasteStockAdditionQuantityInput'].value = ''; });

describe('precarga de entrada de stock', () => {
    it('muestra la existencia resultante al abrir y la actualiza al editar la cantidad', () => {
        openWasteStockAdditionModal({ data: { currentStock: 4 }, quantity: '3', observations: 'Nueva entrada' });
        const input = elements['#wasteStockAdditionQuantityInput'];
        expect(input.value).toBe('3');
        expect(form.elements.observations.value).toBe('Nueva entrada');
        expect(elements['#wasteStockAdditionResultingStock'].textContent).toBe(formatDecimal(7));
        input.value = '2';
        input.oninput();
        expect(elements['#wasteStockAdditionResultingStock'].textContent).toBe(formatDecimal(6));
    });

    it('al abrir desde el listado deja la cantidad vacía y muestra la existencia actual', () => {
        openWasteStockAdditionModal({ data: { currentStock: 4 } });
        expect(elements['#wasteStockAdditionQuantityInput'].value).toBe('');
        expect(form.elements.observations.value).toBe('');
        expect(elements['#wasteStockAdditionResultingStock'].textContent).toBe(formatDecimal(4));
    });

    it('al recuperar un alta con stock cero solicita una cantidad positiva y conserva las observaciones', () => {
        openWasteStockAdditionModal({ data: { currentStock: 4 }, quantity: '0', observations: 'Nueva entrada' });
        expect(elements['#wasteStockAdditionQuantityInput'].value).toBe('');
        expect(form.elements.observations.value).toBe('Nueva entrada');
        expect(elements['#wasteStockAdditionResultingStock'].textContent).toBe(formatDecimal(4));
    });
});
