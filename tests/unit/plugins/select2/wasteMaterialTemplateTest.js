import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({ init: vi.fn(), toggle: vi.fn(), handlers: new Map(), value: null, form: null }));
vi.mock('../../../../src/public/js/plugins/select2/baseSelect.js', () => ({ initDomainSelect2: state.init, toggleSelectOption: state.toggle }));
vi.mock('../../../../src/public/js/plugins/mdb/baseInstance.js', () => ({ setMdbWrapperInputValue: vi.fn() }));
vi.mock('../../../../src/public/js/application/warehouse/wastes/wastes.js', () => ({ getWasteMaterialTemplates: vi.fn() }));
const { initWasteMaterialTemplateSelect } = await import('../../../../src/public/js/plugins/select2/domains/wasteMaterialTemplate.js');
const { updateWasteRollMeasurement } = await import('../../../../src/public/js/ui/inventory/wasteFormUI.js');
const inventoryUtils = await import('../../../../src/public/js/utils/warehouseInventoryUtils.js');

afterEach(() => vi.restoreAllMocks());

beforeEach(() => {
    vi.clearAllMocks();
    state.handlers.clear();
    state.value = null;
    const fields = ['base', 'height', 'weightKg', 'coneWeightKg', 'totalWeightKg', 'sampleLengthM', 'sampleNetWeightKg'];
    const elements = Object.fromEntries(fields.map(field => [field, { value: '', disabled: false, readOnly: false, classList: { toggle: vi.fn() } }]));
    state.form = {
        dataset: { mode: 'create' }, elements,
        querySelector: selector => selector.includes('DisplayValue') ? { textContent: '' } : elements[selector.match(/name='([^']+)'/)?.[1]]
    };
    vi.stubGlobal('document', { querySelector: () => state.form });
    const select = {
        off: events => { events.split(' ').forEach(event => state.handlers.delete(event)); return select; },
        on: (events, handler) => { events.split(' ').forEach(event => state.handlers.set(event, handler)); return select; },
        val: () => state.value
    };
    vi.stubGlobal('$', () => select);
});

describe('selección de material y captura de merma', () => {
    it('utiliza la selección recibida, conserva la oferta y actualiza la medida al capturar pesos', () => {
        initWasteMaterialTemplateSelect({ modalSelector: '#wasteModal', baseSelector: '#materialInput' });
        const offer = { referenceConeWeightKg: '0.25', referenceRollTotalWeightKg: '2.25' };
        const data = {
            id: 'material-1', base: '50', height: '1.5',
            presentation: '{"name":"ROLLO"}', unitMeasure: '{"symbol":"m²"}', supplierMaterials: [offer]
        };
        state.value = data.id;
        state.handlers.get('select2:select')({ params: { data }, target: { get dataset() { throw new Error('No se debe reconstruir la selección desde el DOM'); } } });
        expect(state.form.wasteMaterialTemplate.supplierMaterials[0]).toBe(offer);
        expect(state.form.elements.height.value).toBe(1.5);
        state.form.elements.coneWeightKg.value = '0.25';
        state.form.elements.sampleLengthM.value = '20';
        state.form.elements.sampleNetWeightKg.value = '2';
        state.form.elements.totalWeightKg.value = '1.25';
        updateWasteRollMeasurement({ form: state.form });
        expect(state.form.elements.base.value).toBe(10);
        expect(state.form.elements.weightKg.value).toBe(1);
        expect(state.init).toHaveBeenCalledWith(expect.objectContaining({ clearOnOpen: false }));
    });

    it('una limpieza programática descarta la selección y sus resultados', () => {
        const prepareReference = vi.spyOn(inventoryUtils, 'prepareWasteRollReference');
        initWasteMaterialTemplateSelect({ modalSelector: '#wasteModal', baseSelector: '#materialInput' });
        state.handlers.get('select2:select')({ params: { data: { id: 'material-1', base: 1.5, height: 50, presentation: { name: 'ROLLO' } } } });
        prepareReference.mockClear();
        state.value = null;
        state.handlers.get('change.wasteMaterialTemplate')();
        state.handlers.get('change.wasteMaterialTemplate')();
        expect(prepareReference).toHaveBeenCalledOnce();
        expect(state.form.wasteMaterialTemplate).toBeNull();
        expect(state.form.wasteRollReference).toBeNull();
        expect(state.form.elements.base.value).toBe('');
        expect(state.form.elements.coneWeightKg.disabled).toBe(true);
    });
});
