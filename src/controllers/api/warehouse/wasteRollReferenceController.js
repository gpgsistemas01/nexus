import { findWasteRollReference, saveWasteRollReference } from '../../../services/warehouse/wastes/wasteRollReferenceService.js';
import { createWasteRollReferenceDto } from '../../../dtos/wasteDTO.js';
import { successCodeMessages } from '../../../messages/codeMessages.js';

export const getWasteRollReference = async (req, res) => res.status(200).json({ reference: await findWasteRollReference(req.query) });
export const updateWasteRollReference = async (req, res) => {
    const reference = await saveWasteRollReference({ referenceDto: createWasteRollReferenceDto(req.body), userId: req.user.id });
    return res.status(200).json({ reference, code: successCodeMessages.UPDATED_WASTE_ROLL_REFERENCE });
};
