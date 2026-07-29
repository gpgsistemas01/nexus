import { createSuccessResponseFromRequest } from "../../utils/responseUtils.js";
import { buildMaterialSelectText, mapSupplierMaterialToSelectData } from "../../utils/materialSelectUtils.js";
import { deleteMaterialRequest, editMaterialRequest, editMaterialStockRequest, getAllMaterialsRequest, registerMaterialRequest } from "../../services/warehouse/materialService.js";

export const MATERIAL_SELECT_RESULTS_LIMIT = 20;

export const getMaterialOptions = async (params = {}) => {

    const response = await getAllMaterialsRequest({ params });

    const list = response.data?.data || [];

    return list.filter(material => material?.id && material?.name)
        .map(p => ({
            id: p.id,
            text: buildMaterialSelectText(p)
        }));
}


export const getSupplierMaterialOptions = async (params = {}) => {

    const response = await getAllMaterialsRequest({ params });

    const list = response.data?.data || [];

    return list
        .filter(material => material?.supplierMaterialId && material?.name)
        .map(mapSupplierMaterialToSelectData);
}

export const getAllMaterials = async (params = {}) => {

    const response = await getAllMaterialsRequest({ params });

    return response;
};

const buildMaterialPayload = (formData) => ({
    name: formData.name,
    supplierId: formData.supplierId,
    presentationId: formData.presentationId,
    unitMeasureId: formData.unitMeasureId,
    minStock: formData.minStock,
    maxUnitCost: formData.maxUnitCost,
    base: formData.base,
    height: formData.height,
    isActive: formData.isActive
});

const buildStockPayload = (formData, { includeReason = true } = {}) => ({
    supplierId: formData.supplierId,
    newStock: formData.newStock,
    ...(includeReason ? { reasonId: formData.reasonId } : {}),
    observations: formData.observations
});

export const registerMaterial = async ({
    formData,
    withInitialStockAdjustment = false,
    creationContext = null
}) => {

    const payload = {
        ...buildMaterialPayload(formData),
        ...(creationContext ? { creationContext } : {}),
        ...(withInitialStockAdjustment ? buildStockPayload(formData, { includeReason: false }) : {})
    };

    const response = await registerMaterialRequest({ data: payload });
    const message = withInitialStockAdjustment
        ? '¡Material creado y stock registrado exitosamente!'
        : null;

    return createSuccessResponseFromRequest({
        response,
        dataKey: 'material',
        message
    });
}

export const editMaterial = async ({ formData, id }) => {

    const response = await editMaterialRequest({ data: formData, id });

    return createSuccessResponseFromRequest({ response });
}

export const editMaterialStock = async ({ formData, id }) => {

    const response = await editMaterialStockRequest({ data: formData, id });

    return createSuccessResponseFromRequest({ response });
}


export const deleteMaterial = async (id) => {

    const response = await deleteMaterialRequest({ id });

    return createSuccessResponseFromRequest({ response });
}
