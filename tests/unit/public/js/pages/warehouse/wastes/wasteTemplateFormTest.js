import { afterEach, describe, expect, it, vi } from 'vitest';

import { applyWasteMaterialTemplate } from '../../../../../../../src/public/js/pages/warehouse/wastes/wasteTemplateForm.js';

const createForm = () => {
  const presentationDisplay = { textContent: '—' };
  const unitMeasureDisplay = { textContent: '—' };
  const wrapper = {};
  const baseInput = { value: '', closest: () => wrapper };
  const update = vi.fn();

  vi.stubGlobal('document', {
    querySelector: selector => selector === '#baseInput' ? baseInput : null
  });
  vi.stubGlobal('window', {
    mdb: {
      Input: { getOrCreateInstance: vi.fn(() => ({ update })) }
    }
  });

  return {
    baseInput,
    presentationDisplay,
    unitMeasureDisplay,
    update,
    form: {
      elements: { base: baseInput, maxUnitCost: { value: '' } },
      querySelector: selector => selector.includes('Presentation')
        ? presentationDisplay
        : unitMeasureDisplay
    }
  };
};

describe('plantilla del formulario CRUD de mermas', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('completa presentación, unidad y ancho sugerido de un rollo', () => {
    const { form, presentationDisplay, unitMeasureDisplay, update } = createForm();

    applyWasteMaterialTemplate({
      form,
      template: {
        presentation: { name: 'ROLLO' },
        unitMeasure: { symbol: 'm²' },
        suggestedWidth: 1.52,
        maxUnitCost: 25
      }
    });

    expect(presentationDisplay.textContent).toBe('ROLLO');
    expect(unitMeasureDisplay.textContent).toBe('m²');
    expect(form.elements.base.value).toBe(1.52);
    expect(form.elements.maxUnitCost.value).toBe(25);
    expect(update).toHaveBeenCalledOnce();
  });

  it('completa los snapshots y deja manual el ancho sin sugerencia', () => {
    const { form, presentationDisplay, unitMeasureDisplay, update } = createForm();

    applyWasteMaterialTemplate({
      form,
      template: {
        presentation: { name: 'PIEZA' },
        unitMeasure: { name: 'Pieza' },
        suggestedWidth: null
      }
    });

    expect(presentationDisplay.textContent).toBe('PIEZA');
    expect(unitMeasureDisplay.textContent).toBe('Pieza');
    expect(form.elements.base.value).toBe('');
    expect(form.elements.maxUnitCost.value).toBe('');
    expect(update).toHaveBeenCalledOnce();
  });

});
