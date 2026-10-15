import { WasteWeightInvalid, WasteDimensionsInvalid } from '../../../errors/warehouse/wasteError.js';
import { calculateWasteNetWeight, calculateWasteRollLength, isRollPresentation, prepareWasteRollReference } from '../../../public/js/utils/warehouseInventoryUtils.js';

export const prepareWasteMeasurements = ({ wasteDto, offer }) => {
    const material = offer.material;
    const coneWeightKg = wasteDto.coneWeightKg;
    const isRoll = isRollPresentation(material.presentation.name);
    const hasWeightCapture = coneWeightKg != null || wasteDto.totalWeightKg != null
        || wasteDto.referenceRollTotalWeightKg != null;
    if (hasWeightCapture
        && !isRoll) throw new WasteWeightInvalid();
    const weightKg = isRoll ? calculateWasteNetWeight({ coneWeightKg, totalWeightKg: wasteDto.totalWeightKg }) : null;
    if (isRoll && hasWeightCapture && weightKg == null) throw new WasteWeightInvalid();
    const dimensions = { base: wasteDto.base, height: wasteDto.height };
    let sampleLengthM = null;
    let sampleNetWeightKg = null;
    const reference = prepareWasteRollReference(offer);
    if (reference) {
        dimensions[reference.widthField] = reference.widthM;
        if (weightKg != null) {
            // La muestra es el rollo completo y comparte el mismo cono con el sobrante.
            sampleLengthM = reference.lengthM;
            sampleNetWeightKg = calculateWasteNetWeight({ coneWeightKg, totalWeightKg: wasteDto.referenceRollTotalWeightKg });
            const calculatedLength = calculateWasteRollLength({ weightKg, referenceLengthM: sampleLengthM, referenceNetWeightKg: sampleNetWeightKg });
            if (calculatedLength == null) throw new WasteDimensionsInvalid();
            dimensions[reference.lengthField] = calculatedLength;
        }
    }
    if (weightKg != null && !reference) throw new WasteDimensionsInvalid();

    const { base, height } = dimensions;
    if (![base, height].every(value => Number.isFinite(value) && value > 0)) throw new WasteDimensionsInvalid();
    return { base, height, weightKg, sampleLengthM, sampleNetWeightKg };
};
