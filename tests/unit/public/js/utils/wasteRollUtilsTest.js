import { describe, expect, it } from 'vitest';
import { calculateWasteRollLength, getRollReferenceValidationError } from '../../../../../src/public/js/utils/wasteRollUtils.js';
import { getMaterialIdentityLength, getMaterialLengthField } from '../../../../../src/services/inventory/materialIdentity.js';

describe('referencia del cono y longitud de merma', () => {
    it.each([[50, 1.52, 50], [1.52, 50, 50]])('usa la mayor dimensión del material como longitud: %s × %s', (base, height, length) => {
        expect(getMaterialIdentityLength({ base, height })).toBe(length);
        expect(getMaterialLengthField({ base, height })).toBe(base > height ? 'base' : 'height');
    });
    it('estima longitud por peso neto y ajusta el ancho sin alterar la referencia', () => {
        const reference = { netWeightKg: 1, referenceNetWeightKg: 10, referenceLengthM: 50, referenceWidthM: 1.5 };
        expect(calculateWasteRollLength({ ...reference, widthM: 1.5 })).toBe(5);
        expect(calculateWasteRollLength({ ...reference, widthM: 0.75 })).toBe(10);
        expect(calculateWasteRollLength({ ...reference, widthM: 0 })).toBeNull();
    });
    it('permite cono desconocido salvo que se capture el peso total del rollo', () => {
        expect(getRollReferenceValidationError('', {}, 'referenceConeWeightKg')).toBeNull();
        expect(getRollReferenceValidationError('', { referenceRollTotalWeightKg: 2 }, 'referenceConeWeightKg')).toBe('CONE_WEIGHT_KG_REQUIRED');
    });
    it('acepta cono cero y exige total de muestra mayor que el cono', () => {
        expect(getRollReferenceValidationError(0, {}, 'referenceConeWeightKg')).toBeNull();
        expect(getRollReferenceValidationError(1, { referenceConeWeightKg: 1 }, 'referenceRollTotalWeightKg')).toBe('WASTE_TOTAL_WEIGHT_NOT_GREATER');
    });
});
