import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({ handlers: new Map(), options: [], select: vi.fn(), display: vi.fn() }));
vi.mock('../../../../../../../src/public/js/plugins/select2/baseSelect.js', () => ({
    initDomainSelect2: options => state.options.push(options),
    initFilterSelect2: vi.fn(),
    buildPaginatedSelectParams: vi.fn(),
    runAfterSelect2Close: ({ action }) => action(),
    toggleSelectOption: state.select
}));
vi.mock('../../../../../../../src/public/js/application/warehouse/materials/materials.js', () => ({ getAllMaterials: vi.fn() }));
vi.mock('../../../../../../../src/public/js/application/warehouse/consumables/consumables.js', () => ({ getAllConsumables: vi.fn() }));
vi.mock('../../../../../../../src/public/js/application/warehouse/suppliers/suppliers.js', () => ({ getAllSuppliers: vi.fn() }));
vi.mock('../../../../../../../src/public/js/application/sales/clients/clients.js', () => ({ getAllClients: vi.fn() }));
vi.mock('../../../../../../../src/public/js/plugins/mdb/baseInstance.js', () => ({ setMdbWrapperInputValue: vi.fn() }));
vi.mock('../../../../../../../src/public/js/ui/inventory/inventorySelectUI.js', () => ({ updatePresentationDisplay: state.display }));
vi.stubGlobal('$', selector => ({
    off() { state.handlers.delete(selector); return this; },
    on(event, handler) { state.handlers.set(selector, handler); return this; },
    val: () => 'supplier-1',
    text: () => 'Proveedor'
}));

import { setupSupplierSelect } from '../../../../../../../src/public/js/plugins/select2/domains/supplier.js';
import { setupClientSelect } from '../../../../../../../src/public/js/plugins/select2/domains/client.js';
import { setupMaterialSelect } from '../../../../../../../src/public/js/plugins/select2/domains/material.js';

beforeEach(() => {
    state.handlers.clear();
    state.options.length = 0;
    vi.clearAllMocks();
});

const scenarios = [
    ['proveedor', setupSupplierSelect, { supplierSelector: '#supplier' }, '#supplier', { tradeName: 'Nuevo' }, { id: 'supplier-2', tradeName: 'Nuevo' }],
    ['cliente', setupClientSelect, { clientSelector: '#client' }, '#client', { name: 'Nuevo' }, { id: 'client-2', name: 'Nuevo' }],
    ['material', setupMaterialSelect, { materialSelector: '#material', supplierSelector: '#supplier' }, '#material',
        { name: 'Nuevo', supplier: { id: 'supplier-1', tradeName: 'Proveedor' } },
        { id: 'offer-2', material: { id: 'material-2', name: 'Nuevo', presentation: { name: 'Hoja' } }, supplier: { tradeName: 'Proveedor' } }]
];

describe('creación desde Select2 con callbacks del formulario', () => {
    it.each(scenarios)('abre la captura de %s y selecciona el registro únicamente después de guardar', (label, setup, options, selector, data, saved) => {
        const onCreate = vi.fn();
        setup({ modalSelector: '#modal', ...options, onCreate });
        state.handlers.get(`#modal ${selector}`)({ params: { data: { id: 'new:Nuevo', newTag: true } } });

        expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({ data, onSave: expect.any(Function) }));
        expect(state.select).not.toHaveBeenCalled();
        onCreate.mock.calls[0][0].onSave(saved);
        expect(state.select).toHaveBeenCalledWith(expect.objectContaining({ selector: `#modal ${selector}` }));
    });

    it.each(scenarios)('no ofrece crear %s cuando la página no proporciona esa operación', (label, setup, options) => {
        setup({ modalSelector: '#modal', ...options, allowCreate: true });
        expect(state.options[0].allowCreate).toBe(false);
    });

    it('al seleccionar un material existente actualiza la presentación sin abrir otro modal', () => {
        const onCreate = vi.fn();
        const presentation = { id: 'presentation-1', name: 'Hoja' };
        setupMaterialSelect({ modalSelector: '#modal', materialSelector: '#material', onCreate });
        state.handlers.get('#modal #material')({
            params: { data: { id: 'offer-1', material: JSON.stringify({ id: 'material-1', presentation }) } },
            target: { querySelector: () => null }
        });
        expect(onCreate).not.toHaveBeenCalled();
        expect(state.display).toHaveBeenCalledWith(expect.objectContaining({ presentation }));
    });
});
