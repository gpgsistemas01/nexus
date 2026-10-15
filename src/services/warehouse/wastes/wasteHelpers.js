import { WasteWeightInvalid, WasteDimensionsInvalid } from '../../../errors/warehouse/wasteError.js';
import { calculateWasteNetWeight, calculateWasteRollLength, isRollPresentation, prepareWasteRollReference } from '../../../public/js/utils/warehouseInventoryUtils.js';

export const prepareWasteMeasurements = ({ wasteDto, offer }) => {
    const material = offer.material;
    const coneWeightKg = wasteDto.coneWeightKg;
    const isRoll = isRollPresentation(material.presentation.name);
    const hasWeightCapture = coneWeightKg != null || wasteDto.totalWeightKg != null
        || wasteDto.sampleLengthM != null || wasteDto.sampleNetWeightKg != null;
    if (hasWeightCapture
        && !isRoll) throw new WasteWeightInvalid();
    const weightKg = isRoll ? calculateWasteNetWeight({ coneWeightKg, totalWeightKg: wasteDto.totalWeightKg }) : null;
    if (isRoll && hasWeightCapture && weightKg == null) throw new WasteWeightInvalid();
    const dimensions = { base: wasteDto.base, height: wasteDto.height };
    const reference = prepareWasteRollReference(offer);
    if (reference) {
        dimensions[reference.widthField] = reference.widthM;
        if (weightKg != null) {
            const calculatedLength = calculateWasteRollLength({ weightKg, sampleLengthM: wasteDto.sampleLengthM, sampleNetWeightKg: wasteDto.sampleNetWeightKg });
            if (calculatedLength == null) throw new WasteDimensionsInvalid();
            dimensions[reference.lengthField] = calculatedLength;
        }
    }
    if (weightKg != null && !reference) throw new WasteDimensionsInvalid();

    const { base, height } = dimensions;
    if (![base, height].every(value => Number.isFinite(value) && value > 0)) throw new WasteDimensionsInvalid();
    return { base, height, weightKg };
};
