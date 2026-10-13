import { describe, expect, it } from 'vitest';
import { calculateWasteRollLength } from '../../../../../src/public/js/utils/warehouseInventoryUtils.js';
import { validateMaterialRollReference } from '../../../../../src/public/js/utils/validations/fieldValidations.js';
import { getErrorMessage } from '../../../../../src/public/js/constants/apiMessages.js';
import { prepareWasteMeasurements } from '../../../../../src/services/warehouse/wastes/wasteHelpers.js';
import { getMaterialIdentityLength, getMaterialLengthField } from '../../../../../src/services/inventory/materialIdentity.js';

describe('referencia del cono y longitud de merma', () => {
    it.each([[50, 1.52, 50], [1.52, 50, 50]])('usa la mayor dimensión del material como longitud: %s × %s', (base, height, length) => {
        expect(getMaterialIdentityLength({ base, height })).toBe(length);
        expect(getMaterialLengthField({ base, height })).toBe(base > height ? 'base' : 'height');
    });
    it('estima longitud por peso neto con el ancho del material', () => {
        const reference = { weightKg: 1, referenceRollNetWeightKg: 10, referenceLengthM: 50 };
        expect(calculateWasteRollLength(reference)).toBe(5);
        expect(calculateWasteRollLength({ ...reference, referenceRollNetWeightKg: 5 })).toBe(10);
        expect(calculateWasteRollLength({ ...reference, referenceRollNetWeightKg: 0 })).toBeNull();
    });
    it('permite cono desconocido salvo que se capture el peso total del rollo', () => {
        expect(validateMaterialRollReference('', {}, 'referenceConeWeightKg')).toBeNull();
        expect(validateMaterialRollReference('', { referenceRollTotalWeightKg: 2 }, 'referenceConeWeightKg')).toBe(getErrorMessage({ code: 'CONE_WEIGHT_KG_REQUIRED' }));
    });
    it('acepta cono cero y exige total de muestra mayor que el cono', () => {
        expect(validateMaterialRollReference(0, {}, 'referenceConeWeightKg')).toBeNull();
        expect(validateMaterialRollReference(1, { referenceConeWeightKg: 1 }, 'referenceRollTotalWeightKg')).toBe(getErrorMessage({ code: 'WASTE_TOTAL_WEIGHT_NOT_GREATER' }));
    });
});


it('omite referencias y cálculos de peso cuando la merma no es Rollo', () => {
    const offer = {
        material: { presentation: { name: 'LÁMINA' } },
        get referenceConeWeightKg() { throw new Error('No debe consultar pesos'); },
        get referenceRollTotalWeightKg() { throw new Error('No debe consultar pesos'); }
    };
    expect(prepareWasteMeasurements({ wasteDto: { base: 1, height: 2 }, offer })).toEqual({ base: 1, height: 2, weightKg: null });
});
