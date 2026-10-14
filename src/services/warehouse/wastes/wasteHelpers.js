import { WasteWeightInvalid, WasteDimensionsInvalid } from '../../../errors/warehouse/wasteError.js';
import { calculateWasteNetWeight, calculateWasteRollLength, isRollPresentation, prepareWasteRollReference } from '../../../public/js/utils/warehouseInventoryUtils.js';

export const prepareWasteMeasurements = ({ wasteDto, offer }) => {
    const material = offer.material;
    const coneWeightKg = wasteDto.coneWeightKg;
    const isRoll = isRollPresentation(material.presentation.name);
    if ((coneWeightKg != null || wasteDto.totalWeightKg != null)
        && !isRoll) throw new WasteWeightInvalid();
    const weightKg = isRoll ? calculateWasteNetWeight({ coneWeightKg, totalWeightKg: wasteDto.totalWeightKg }) : null;
    if (isRoll && (coneWeightKg != null || wasteDto.totalWeightKg != null) && weightKg == null) throw new WasteWeightInvalid();
    const dimensions = { base: wasteDto.base, height: wasteDto.height };
    const reference = prepareWasteRollReference(offer);
    if (reference) {
        dimensions[reference.widthField] = reference.widthM;
        if (weightKg != null) {
            const calculatedLength = calculateWasteRollLength({ weightKg, ...reference });
            if (calculatedLength != null) dimensions[reference.lengthField] = calculatedLength;
        }
    }

    const { base, height } = dimensions;
    if (![base, height].every(value => Number.isFinite(value) && value > 0)) throw new WasteDimensionsInvalid();
    return { base, height, weightKg };
};
