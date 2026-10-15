import { describe, expect, it, vi } from 'vitest';
import { materialCreateValidation } from '../../../../../../src/public/js/utils/validations/validators.js';

vi.mock('../../../../../../src/public/js/plugins/mdb/baseInstance.js', () => ({ setMdbWrapperInputValue: vi.fn() }));
const { updateMaterialMeasurementFields } = await import('../../../../../../src/public/js/ui/inventory/inventorySelectUI.js');

const createForm = ({ unit = 'pza - PIEZA', mode = 'create', resource = 'material' } = {}) => {
  const elements = Object.fromEntries(['base', 'height'].map(field => [field, {
    value: field === 'base' ? '2' : '', required: true,
    classList: { toggle: vi.fn() }, closest: () => null
  }]));
  elements.unitMeasureId = { selectedOptions: [{ textContent: unit }] };
  const section = { classList: { toggle: vi.fn() } };
  const feedback = Object.fromEntries(['base', 'height'].map(field => [field, {
    textContent: 'Medida requerida', classList: { toggle: vi.fn() }
  }]));
  return {
    dataset: { mode, resource }, elements, section, feedback,
    querySelector: selector => selector === '.material-measurements-section' ? section
      : selector.startsWith('[data-error-for=') ? feedback[selector.match(/='([^']+)'/)?.[1]]
        : elements[selector.match(/name='([^']+)'/)?.[1]]
  };
};

describe('medidas de material según la unidad seleccionada', () => {
  it('oculta, deshabilita y limpia medidas y errores al cambiar de metros a pieza', () => {
    const form = createForm({ unit: 'm² - METRO CUADRADO' });
    updateMaterialMeasurementFields({ form });
    expect(form.elements.base.disabled).toBe(false);

    form.elements.unitMeasureId.selectedOptions[0].textContent = 'pza - PIEZA';
    updateMaterialMeasurementFields({ form });

    expect(form.section.classList.toggle).toHaveBeenLastCalledWith('d-none', true);
    for (const field of ['base', 'height']) {
      expect(form.elements[field]).toMatchObject({ value: '', disabled: true, required: false });
      expect(form.feedback[field].textContent).toBe('');
      expect(materialCreateValidation[field](undefined, {})).toBeNull();
    }
  });

  it.each(['m² - METROS CUADRADOS', 'm2 - Unidad de superficie', 'm - METRO LINEAL', 'L - LITRO', 'lt - LITROS'])('habilita la pareja opcional para %s', unit => {
    const form = createForm();
    updateMaterialMeasurementFields({ form });
    form.elements.unitMeasureId.selectedOptions[0].textContent = unit;
    updateMaterialMeasurementFields({ form });

    expect(form.section.classList.toggle).toHaveBeenLastCalledWith('d-none', false);
    expect(form.elements.base).toMatchObject({ disabled: false, required: false });
    expect(form.elements.height.disabled).toBe(false);
    expect(materialCreateValidation.height(undefined, { base: 2 })).toEqual(expect.any(String));
    expect(materialCreateValidation.height(3, { base: 2, height: 3 })).toBeNull();
  });

  it.each(['', 'kg - KILOGRAMO'])('oculta las medidas cuando la selección no las utiliza: %s', unit => {
    const form = createForm({ unit });
    updateMaterialMeasurementFields({ form });
    expect(form.elements.base).toMatchObject({ value: '', disabled: true });
    expect(form.section.classList.toggle).toHaveBeenCalledWith('d-none', true);
  });

  it.each(['edit', 'edit-stock', 'view'])('mantiene las medidas guardadas e inmutables en modo %s', mode => {
    const form = createForm({ unit: 'm² - METRO CUADRADO', mode });
    updateMaterialMeasurementFields({ form });
    expect(form.elements.base).toMatchObject({ value: '2', disabled: true });
    expect(form.elements.height.disabled).toBe(true);
  });

  it('conserva los consumibles sin medidas aunque su unidad sea metro', () => {
    const form = createForm({ resource: 'consumable', unit: 'm - METRO' });
    updateMaterialMeasurementFields({ form });
    expect(form.section.classList.toggle).toHaveBeenCalledWith('d-none', true);
    expect(form.elements.base).toMatchObject({ value: '', disabled: true });
  });
});
