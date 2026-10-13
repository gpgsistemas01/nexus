import { getDb } from '../../../repository/baseRepository.js';
import { isAppError } from '../../../errors/AppError.js';
import { MaterialNotFound, MaterialUpdateDatabaseError } from '../../../errors/warehouse/materialError.js';
import { WasteRollReferenceInvalid } from '../../../errors/warehouse/wasteError.js';
import { calculateWasteNetWeight, isRollPresentation } from '../../../public/js/utils/warehouseInventoryUtils.js';
import { getMaterialIdentityLength, getMaterialIdentityWidth } from '../../inventory/materialIdentity.js';
import { createServiceLogger, logServiceError } from '../../../utils/logger.js';

const logger = createServiceLogger('warehouse.wastes.wasteRollReferenceService');

const findOffer = async ({ tx = null, supplierId, materialId }) => {
    const offer = await getDb(tx).supplierMaterial.findUnique({
        where: { supplierId_materialId: { supplierId, materialId } },
        include: { material: { include: { presentation: true } } }
    });
    if (!offer?.isActive) throw new MaterialNotFound();
    if (!isRollPresentation(offer.material.presentation.name) || offer.material.type === 'CONSUMABLE') throw new WasteRollReferenceInvalid();
    return offer;
};

const toReference = offer => ({
    supplierId: offer.supplierId, materialId: offer.materialId,
    coneWeightMode: offer.coneWeightMode,
    referenceConeWeightKg: offer.referenceConeWeightKg,
    referenceRollTotalWeightKg: offer.referenceRollTotalWeightKg,
    referenceRollNetWeightKg: offer.referenceRollNetWeightKg,
    referenceLengthM: getMaterialIdentityLength(offer.material),
    referenceWidthM: getMaterialIdentityWidth(offer.material)
});

export const findWasteRollReference = async data => toReference(await findOffer(data));

export const saveWasteRollReference = async ({ referenceDto, userId }) => {
    try {
        return await getDb().$transaction(async tx => {
            const offer = await findOffer({ tx, ...referenceDto });
            const { coneWeightMode, referenceConeWeightKg, referenceRollTotalWeightKg } = referenceDto;
            const updated = await tx.supplierMaterial.update({
                where: { id: offer.id },
                data: {
                    coneWeightMode, referenceConeWeightKg, referenceRollTotalWeightKg,
                    referenceRollNetWeightKg: calculateWasteNetWeight({ coneWeightKg: referenceConeWeightKg, totalWeightKg: referenceRollTotalWeightKg })
                },
                include: { material: { include: { presentation: true } } }
            });
            return toReference(updated);
        });
    } catch (err) {
        logServiceError(logger, err, { operation: 'saveWasteRollReference', userId, materialId: referenceDto.materialId, supplierId: referenceDto.supplierId }, 'Error al guardar referencia de rollo');
        if (isAppError(err)) throw err;
        throw new MaterialUpdateDatabaseError();
    }
};
