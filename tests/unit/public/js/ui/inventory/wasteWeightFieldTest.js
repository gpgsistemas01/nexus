import { describe, expect, it, vi } from 'vitest';
vi.mock('../../../../../../src/public/js/plugins/mdb/baseInstance.js', () => ({ setMdbWrapperInputValue: vi.fn() }));
const { applyWasteMaterialTemplate, configureWasteWeightFields, updateWasteRollMeasurement } = await import('../../../../../../src/public/js/ui/inventory/wasteFormUI.js');
const createForm = (mode = 'create') => ({
  dataset: { mode },
  elements: Object.fromEntries(['base', 'height', 'coneWeightKg', 'totalWeightKg', 'weightKg', 'sampleLengthM', 'sampleNetWeightKg'].map(name => [name, { value: '', disabled: false, classList: { toggle: vi.fn() } }])),
  querySelector(selector) { return this.elements[selector?.match(/name='([^']+)'/)?.[1]]; }
});
const roll = { name: 'Lona', base: 1.5, height: 20, presentation: { name: 'ROLLO' }, unitMeasure: { symbol: 'm²' } };

describe('muestra y pesos en el formulario de merma', () => {
  it.each([[1.5, 20, 'base', 'height'], [20, 1.5, 'height', 'base']])('fija el ancho menor y calcula la otra medida con la muestra: %s × %s', (base, height, fixed, calculated) => {
    const form = createForm();
    applyWasteMaterialTemplate({ form, template: { ...roll, base, height } });
    expect(form.elements[fixed]).toMatchObject({ value: 1.5, disabled: true });
    expect(form.elements[calculated].disabled).toBe(true);
    Object.assign(form.elements.coneWeightKg, { value: '0.25' });
    Object.assign(form.elements.totalWeightKg, { value: '1.25' });
    form.elements.sampleLengthM.value = '2';
    form.elements.sampleNetWeightKg.value = '0.2';
    updateWasteRollMeasurement({ form });
    expect(form.elements.weightKg.value).toBe(1);
    expect(form.elements[calculated].value).toBe(10);
    form.elements.sampleNetWeightKg.value = '0.4';
    updateWasteRollMeasurement({ form });
    expect(form.elements[calculated].value).toBe(5);
    form.elements.sampleNetWeightKg.value = '';
    updateWasteRollMeasurement({ form });
    expect(form.elements[calculated].value).toBe('');
    expect(form.elements.weightKg.value).toBe(1);
    form.elements.coneWeightKg.value = '';
    updateWasteRollMeasurement({ form });
    expect(form.elements.weightKg.value).toBe('');
  });
  it.each(['edit', 'edit-stock', 'view'])('conserva muestra y pesos guardados sin recalcular en %s', mode => {
    const form = createForm(mode);
    form.elements.sampleLengthM.value = '2';
    form.elements.weightKg.value = '1';
    form.elements.height.value = '10';
    configureWasteWeightFields({ form, template: { ...roll, sampleLengthM: 2, sampleNetWeightKg: 0.2 } });
    updateWasteRollMeasurement({ form });
    expect(form.elements.sampleLengthM).toMatchObject({ value: '2', disabled: true });
    expect(form.elements.weightKg.value).toBe('1');
    expect(form.elements.height.value).toBe('10');
  });
  it('descarta la muestra al cambiar a Hoja y habilita sus medidas manuales', () => {
    const form = createForm();
    form.elements.sampleLengthM.value = '2';
    applyWasteMaterialTemplate({ form, template: { ...roll, presentation: { name: 'HOJA' } } });
    expect(form.elements.sampleLengthM).toMatchObject({ value: '', disabled: true });
    expect(form.elements.base.disabled).toBe(false);
    expect(form.elements.height.disabled).toBe(false);
  });
  it('no precarga pesos del rollo completo como pesos de merma', () => {
    const form = createForm();
    const template = { ...roll, get supplierMaterials() { throw new Error('Referencia histórica no aplicable'); } };
    applyWasteMaterialTemplate({ form, template });
    expect(form.elements.coneWeightKg.value).toBe('');
    expect(form.elements.totalWeightKg.value).toBe('');
  });
});
