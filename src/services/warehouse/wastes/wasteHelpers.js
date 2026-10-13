import { WasteWeightInvalid, WasteDimensionsInvalid } from '../../../errors/warehouse/wasteError.js';
import { toNumber } from '../../../utils/formattersUtils.js';
import { getMaterialIdentityLength, getMaterialLengthField } from '../../inventory/materialIdentity.js';
import { calculateWasteNetWeight, calculateWasteRollLength, isRollPresentation } from '../../../public/js/utils/warehouseInventoryUtils.js';

export const prepareWasteMeasurements = ({ wasteDto, offer }) => {
    const material = offer.material;
    const coneWeightKg = wasteDto.coneWeightKg;
    const isRoll = isRollPresentation(material.presentation.name);
    if ((coneWeightKg != null || wasteDto.totalWeightKg != null)
        && !isRoll) throw new WasteWeightInvalid();
    const weightKg = isRoll ? calculateWasteNetWeight({ coneWeightKg, totalWeightKg: wasteDto.totalWeightKg }) : null;
    const dimensions = { base: wasteDto.base, height: wasteDto.height };
    const lengthField = isRoll ? getMaterialLengthField(material) : null;
    if (lengthField) {
        const widthField = lengthField === 'base' ? 'height' : 'base';
        dimensions[widthField] = toNumber(material[widthField]);
        if (weightKg != null) {
            const calculatedLength = calculateWasteRollLength({
                netWeightKg: weightKg,
                referenceNetWeightKg: calculateWasteNetWeight({ coneWeightKg: offer.referenceConeWeightKg, totalWeightKg: offer.referenceRollTotalWeightKg }),
                referenceLengthM: getMaterialIdentityLength(material)
            });
            if (calculatedLength != null) dimensions[lengthField] = calculatedLength;
        }
    }

    const { base, height } = dimensions;
    if (![base, height].every(value => Number.isFinite(value) && value > 0)) throw new WasteDimensionsInvalid();
    return { base, height, weightKg };
};
