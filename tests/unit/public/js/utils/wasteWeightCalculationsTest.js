import { describe, expect, it } from 'vitest';
import { calculateWasteRollLength, prepareWasteRollReference } from '../../../../../src/public/js/utils/warehouseInventoryUtils.js';
import { prepareWasteMeasurements } from '../../../../../src/services/warehouse/wastes/wasteHelpers.js';

const material = { base: 1.5, height: 20, presentation: { name: 'ROLLO' } };

describe('longitud de merma a partir del rollo completo con cono', () => {
  it.each([[50, 1.5, 'base', 'height'], [1.5, 50, 'height', 'base']])('conserva el ancho menor y obtiene el largo del material: %s × %s', (base, height, lengthField, widthField) => {
    expect(prepareWasteRollReference({ material: { ...material, base, height } }))
      .toEqual({ lengthField, widthField, widthM: 1.5, lengthM: 50 });
  });
  it('calcula la proporción con pesos netos y rechaza una referencia sin peso', () => {
    expect(calculateWasteRollLength({ weightKg: 1, referenceLengthM: 20, referenceNetWeightKg: 2 })).toBe(10);
    expect(calculateWasteRollLength({ weightKg: 1, referenceLengthM: 20, referenceNetWeightKg: 0 })).toBeNull();
  });
  it('incorpora al formulario y al servicio la misma longitud con dos decimales', () => {
    expect(calculateWasteRollLength({ weightKg: 1, referenceLengthM: 20, referenceNetWeightKg: 3 })).toBe(6.67);
    expect(prepareWasteMeasurements({ offer: { material }, wasteDto: {
      coneWeightKg: 0.25, totalWeightKg: 1.25, referenceRollTotalWeightKg: 3.25
    } })).toEqual({ base: 1.5, height: 6.67, weightKg: 1 });
  });
  it('descuenta una sola vez el mismo cono a ambos totales sin devolver valores intermedios para persistir', () => {
    const offer = { material, get referenceConeWeightKg() { throw new Error('Histórico de proveedor no aplicable'); } };
    expect(prepareWasteMeasurements({ offer, wasteDto: { referenceRollTotalWeightKg: 2.25, coneWeightKg: 0.25, totalWeightKg: 1.25, base: 999, height: 999, sampleLengthM: 999, sampleNetWeightKg: 999 } }))
      .toEqual({ base: 1.5, height: 10, weightKg: 1 });
  });
  it.each([undefined, 0.25, 0.1])('rechaza un rollo completo sin peso neto válido: %s', referenceRollTotalWeightKg => {
    expect(() => prepareWasteMeasurements({ offer: { material }, wasteDto: { referenceRollTotalWeightKg, coneWeightKg: 0.25, totalWeightKg: 1.25, base: 1.5, height: 10 } }))
      .toThrow(expect.objectContaining({ code: 'WASTE_DIMENSIONS_INVALID' }));
  });
  it('rechaza un alta de Rollo sin pesos aunque el cliente envíe medidas manuales', () => {
    expect(() => prepareWasteMeasurements({ offer: { material }, wasteDto: { base: 1.5, height: 10 } }))
      .toThrow(expect.objectContaining({ code: 'WASTE_WEIGHT_INVALID' }));
  });
  it('rechaza un Rollo sin largo nominal aunque el cliente envíe dimensiones', () => {
    expect(() => prepareWasteMeasurements({ offer: { material: { ...material, height: null } }, wasteDto: { coneWeightKg: 0.25, totalWeightKg: 1.25, referenceRollTotalWeightKg: 2.25, base: 1.5, height: 10 } }))
      .toThrow(expect.objectContaining({ code: 'WASTE_DIMENSIONS_INVALID' }));
  });
  it('conserva medidas manuales y ausencia de pesos para Hoja', () => {
    expect(prepareWasteMeasurements({ offer: { material: { presentation: { name: 'HOJA' } } }, wasteDto: { base: 1, height: 2 } }))
      .toEqual({ base: 1, height: 2, weightKg: null });
  });
});
