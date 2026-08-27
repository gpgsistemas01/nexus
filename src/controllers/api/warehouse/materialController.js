import { createMaterialDtoForEdit, createMaterialDtoForRegister, createMaterialDtoForStockUpdate } from "../../../dtos/materialDTO.js";
import { successCodeMessages } from "../../../messages/codeMessages.js";
import { findAllMaterials, createMaterial, updateMaterial, updateMaterialStock, deleteMaterial } from "../../../services/warehouse/materials/materialService.js";
import { sanitizeEmptyStrings } from "../../../utils/formattersUtils.js";
import { getDataTableOrder, getDataTablePaging, getDataTableSearch } from "../../../utils/requestQueryUtils.js";
import { emitInventoryUpdated } from "../../../utils/socketUtils.js";
import { PERMISSIONS } from '../../../constants/permissions.js';

export const getAllMaterials = async (req, res) => {

    const { skip, take } = getDataTablePaging(req.query);
    const search = getDataTableSearch(req.query);
    const supplierId = req.query.supplierId || null;

    const columns = ['name', 'base', 'height', null, 'minStock', null, null, null, null, null];
    const { orderBy, orderDir } = getDataTableOrder({
        query: req.query,
        columns
    });

    const result = await findAllMaterials({
        skip,
        take,
        search,
        supplierId,
        orderBy,
        orderDir,
        canReadCosts: req.user.permissions.includes(PERMISSIONS.INVENTORY_COSTS_READ)
    });

    return res.status(200).json(result);
}

export const registerMaterial = async (req, res) => {

    const materialDto = createMaterialDtoForRegister(req.body);
    const sanitizedMaterialDto = sanitizeEmptyStrings(materialDto);
    const material = await createMaterial({
        materialDto: sanitizedMaterialDto,
        userId: req.user.id
    });

    return res.status(200).json({
        material,
        code: successCodeMessages.CREATED_MATERIAL
    });
}

export const editMaterial = async (req, res) => {

    const materialDto = createMaterialDtoForEdit(req.body);
    const sanitizedMaterialDto = sanitizeEmptyStrings(materialDto);

    const material = await updateMaterial(sanitizedMaterialDto, req.params.id);

    return res.status(200).json({
        material,
        code: successCodeMessages.UPDATED_MATERIAL
    });
}

export const editMaterialStock = async (req, res) => {

    const materialDto = createMaterialDtoForStockUpdate(req.body);
    const sanitizedMaterialDto = sanitizeEmptyStrings(materialDto);

    const material = await updateMaterialStock({
        materialDto: sanitizedMaterialDto,
        userId: req.user.id,
        id: req.params.id
    });

    emitInventoryUpdated({ context: 'material', source: 'stock-adjustment-created' });

    return res.status(200).json({
        material,
        code: successCodeMessages.UPDATED_MATERIAL
    });
}

export const removeMaterial = async (req, res) => {

    const material = await deleteMaterial(req.params.id);

    return res.status(200).json({
        material,
        code: successCodeMessages.DELETED_MATERIAL
    });
}
