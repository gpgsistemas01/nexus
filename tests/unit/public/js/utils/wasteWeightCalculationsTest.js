import { describe, expect, it } from 'vitest';
import { calculateWasteRollLength, prepareWasteRollReference } from '../../../../../src/public/js/utils/warehouseInventoryUtils.js';
import { prepareWasteMeasurements } from '../../../../../src/services/warehouse/wastes/wasteHelpers.js';

const material = { base: 1.5, height: 20, presentation: { name: 'ROLLO' } };
const sample = { sampleLengthM: 2, sampleNetWeightKg: 0.2 };

describe('longitud de merma a partir de una muestra', () => {
  it.each([[50, 1.5, 'base', 'height'], [1.5, 50, 'height', 'base']])('prepara una sola vez el ancho menor y el campo longitudinal: %s × %s', (base, height, lengthField, widthField) => {
    expect(prepareWasteRollReference({ material: { ...material, base, height } }))
      .toEqual({ lengthField, widthField, widthM: 1.5 });
  });
  it('estima el largo por la proporción peso/largo de la muestra', () => {
    expect(calculateWasteRollLength({ weightKg: 1, ...sample })).toBe(10);
    expect(calculateWasteRollLength({ weightKg: 1, sampleLengthM: 1, sampleNetWeightKg: 0.057 })).toBe(17.54386);
    expect(calculateWasteRollLength({ weightKg: 1, ...sample, sampleNetWeightKg: 0 })).toBeNull();
  });
  it('calcula en el servidor y no consulta pesos históricos del material', () => {
    const offer = { material, get referenceConeWeightKg() { throw new Error('Histórico no aplicable'); } };
    expect(prepareWasteMeasurements({ offer, wasteDto: { ...sample, coneWeightKg: 0.25, totalWeightKg: 1.25, base: 999, height: 999 } }))
      .toEqual({ base: 1.5, height: 10, weightKg: 1 });
  });
  it('rechaza un cálculo sin muestra aunque se envíen medidas desde el cliente', () => {
    expect(() => prepareWasteMeasurements({ offer: { material }, wasteDto: { coneWeightKg: 0, totalWeightKg: 1, base: 1.5, height: 10 } }))
      .toThrow(expect.objectContaining({ code: 'WASTE_DIMENSIONS_INVALID' }));
  });
  it('conserva medidas manuales y ausencia de pesos para Hoja', () => {
    expect(prepareWasteMeasurements({ offer: { material: { presentation: { name: 'HOJA' } } }, wasteDto: { base: 1, height: 2 } }))
      .toEqual({ base: 1, height: 2, weightKg: null });
  });
});
