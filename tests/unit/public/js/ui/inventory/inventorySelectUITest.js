import { afterEach, describe, expect, it, vi } from 'vitest';

const { applyWasteMaterialTemplate } = await import(
  '../../../../../../src/public/js/ui/inventory/inventorySelectUI.js'
);

const createForm = () => {
  const nameDisplay = { textContent: '—' };
  const presentationDisplay = { textContent: '—' };
  const unitMeasureDisplay = { textContent: '—' };
  const wrapper = {};
  const baseInput = { value: '', closest: () => wrapper, classList: { toggle: vi.fn() } };
  const maxUnitCostInput = { value: '', closest: () => wrapper, classList: { toggle: vi.fn() } };
  const update = vi.fn();

  vi.stubGlobal('document', {
    querySelector: selector => ({
      '#baseInput': baseInput,
      '#maxUnitCostInput': maxUnitCostInput
    })[selector] ?? null
  });
  vi.stubGlobal('window', {
    mdb: {
      Input: { getOrCreateInstance: vi.fn(() => ({ update })) }
    }
  });

  return {
    baseInput,
    nameDisplay,
    presentationDisplay,
    unitMeasureDisplay,
    update,
    form: {
      elements: { base: baseInput, maxUnitCost: maxUnitCostInput },
      querySelector: selector => ({
        '#wasteNameDisplayValue': nameDisplay,
        '#wastePresentationDisplayValue': presentationDisplay,
        '#wasteUnitMeasureDisplayValue': unitMeasureDisplay
      })[selector]
    }
  };
};

describe('plantilla del formulario CRUD de mermas', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('completa presentación, unidad y ancho sugerido de un rollo', () => {
    const { form, nameDisplay, presentationDisplay, unitMeasureDisplay, update } = createForm();

    applyWasteMaterialTemplate({
      form,
      template: {
        name: 'Lona Front',
        presentation: { name: 'ROLLO' },
        unitMeasure: { symbol: 'm²' },
        suggestedWidth: 1.52,
        maxUnitCost: 25
      }
    });

    expect(nameDisplay.value).toBe('Lona Front');
    expect(presentationDisplay.textContent).toBe('ROLLO');
    expect(unitMeasureDisplay.textContent).toBe('m²');
    expect(form.elements.base.value).toBe(1.52);
    expect(form.elements.maxUnitCost.value).toBe(25);
    expect(update).toHaveBeenCalledTimes(2);
  });

  it('completa los snapshots y deja manual el ancho sin sugerencia', () => {
    const { form, nameDisplay, presentationDisplay, unitMeasureDisplay, update } = createForm();

    applyWasteMaterialTemplate({
      form,
      template: {
        name: 'Coroplast',
        presentation: { name: 'PIEZA' },
        unitMeasure: { name: 'Pieza' },
        suggestedWidth: null
      }
    });

    expect(nameDisplay.value).toBe('Coroplast');
    expect(presentationDisplay.textContent).toBe('PIEZA');
    expect(unitMeasureDisplay.textContent).toBe('Pieza');
    expect(form.elements.base.value).toBe('');
    expect(form.elements.maxUnitCost.value).toBe('');
    expect(update).toHaveBeenCalledTimes(2);
  });

  it('limpia los datos relacionados cuando se deselecciona el material', () => {
    const { form, nameDisplay, presentationDisplay, unitMeasureDisplay, update } = createForm();
    form.elements.base.value = '1.52';
    form.elements.maxUnitCost.value = '25';

    applyWasteMaterialTemplate({ form });

    expect(nameDisplay.value).toBe('');
    expect(presentationDisplay.textContent).toBe('—');
    expect(unitMeasureDisplay.textContent).toBe('—');
    expect(form.elements.base.value).toBe('');
    expect(form.elements.maxUnitCost.value).toBe('');
    expect(form.elements.base.classList.toggle).toHaveBeenLastCalledWith('active', false);
    expect(form.elements.maxUnitCost.classList.toggle).toHaveBeenLastCalledWith('active', false);
    expect(update).toHaveBeenCalledTimes(2);
  });

});
