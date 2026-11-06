import { WasteWeightInvalid, WasteDimensionsInvalid, WasteMaterialInvalid, WasteNotFound } from '../../../errors/warehouse/wasteError.js';
import { SupplierInactiveConflict } from '../../../errors/warehouse/supplierError.js';
import { MATERIAL_TYPES } from '../../../shared/constants/inventory.js';
import {
    calculateWasteNetWeight,
    calculateWasteRollLength,
    isRollPresentation,
    prepareWasteRollReference,
    isSquareMeterUnitMeasure
} from '../../../shared/inventory/wasteMeasurements.js';

export const assertWasteMaterialReference = offer => {
    if (offer?.supplier?.isActive === false) throw new SupplierInactiveConflict();
    if (!offer?.isActive) throw new WasteNotFound();
    if (offer.material.type !== MATERIAL_TYPES.MATERIAL || !isSquareMeterUnitMeasure(offer.material.unitMeasure)) {
        throw new WasteMaterialInvalid();
    }
};

export const prepareWasteMeasurements = ({ wasteDto, offer }) => {
    const material = offer.material;
    const coneWeightKg = wasteDto.coneWeightKg;
    const isRoll = isRollPresentation(material.presentation.name);
    const hasWeightCapture = coneWeightKg != null || wasteDto.totalWeightKg != null
        || wasteDto.referenceRollTotalWeightKg != null;
    if (!isRoll && hasWeightCapture) throw new WasteWeightInvalid();
    const weightKg = isRoll ? calculateWasteNetWeight({ coneWeightKg, totalWeightKg: wasteDto.totalWeightKg }) : null;
    // RF-MER-011/012: un alta de Rollo exige pesos; las medidas manuales no sustituyen la referencia.
    if (isRoll && weightKg == null) throw new WasteWeightInvalid();
    const reference = prepareWasteRollReference(offer);
    if (isRoll && !reference) throw new WasteDimensionsInvalid();
    const dimensions = { base: wasteDto.base, height: wasteDto.height };
    if (reference) {
        dimensions[reference.widthField] = reference.widthM;
        // La muestra es el rollo completo y comparte el mismo cono con el sobrante.
        const referenceNetWeightKg = calculateWasteNetWeight({ coneWeightKg, totalWeightKg: wasteDto.referenceRollTotalWeightKg });
        const calculatedLength = calculateWasteRollLength({ weightKg, referenceLengthM: reference.lengthM, referenceNetWeightKg });
        if (calculatedLength == null) throw new WasteDimensionsInvalid();
        dimensions[reference.lengthField] = calculatedLength;
    }

    const { base, height } = dimensions;
    if (![base, height].every(value => Number.isFinite(value) && value > 0)) throw new WasteDimensionsInvalid();
    return { base, height, weightKg };
};
