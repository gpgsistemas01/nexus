import { createSuccessResponseFromRequest } from "../../utils/responseUtils.js";
import { buildMaterialSelectText } from "../../utils/materialSelectUtils.js";
import { deleteMaterialRequest, editMaterialRequest, editMaterialStockRequest, getAllMaterialsRequest, registerMaterialRequest } from "../../services/warehouse/materialService.js";

export const MATERIAL_SELECT_RESULTS_LIMIT = 20;
const GOODS_RECEIPT_CREATION_CONTEXT = 'goodsReceipt';

export const getMaterialOptions = async (params = {}) => {

    const response = await getAllMaterialsRequest({ params });

    const list = response.data?.data || [];

    return list.filter(material => material?.id && material?.name)
        .map(p => ({
            id: p.id,
            text: buildMaterialSelectText(p)
        }));
}


export const getAllMaterials = async (params = {}) => {

    const response = await getAllMaterialsRequest({ params });

    return response;
};

const buildMaterialPayload = (formData, { includeMaxUnitCost = true } = {}) => ({
    name: formData.name,
    supplierId: formData.supplierId,
    presentationId: formData.presentationId,
    unitMeasureId: formData.unitMeasureId,
    minStock: formData.minStock,
    ...(includeMaxUnitCost ? { maxUnitCost: formData.maxUnitCost } : {}),
    base: formData.base,
    height: formData.height,
    isActive: formData.isActive
});

export const registerMaterial = async ({
    formData,
    creationContext = null
}) => {

    const payload = {
        ...buildMaterialPayload(formData, {
            // In a purchase, the real unit cost comes from its detail line and is
            // applied to SupplierMaterial when the receipt is confirmed.
            includeMaxUnitCost: creationContext !== GOODS_RECEIPT_CREATION_CONTEXT
        }),
        ...(creationContext ? { creationContext } : {})
    };

    const response = await registerMaterialRequest({ data: payload });
    return createSuccessResponseFromRequest({
        response,
        dataKey: 'material'
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
