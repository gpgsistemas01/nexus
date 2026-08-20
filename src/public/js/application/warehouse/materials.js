import { createSuccessResponseFromRequest } from "../../utils/responseUtils.js";
import { buildInventorySelectText } from "../../utils/warehouseInventoryUtils.js";
import { deleteMaterialRequest, editMaterialRequest, editMaterialStockRequest, getAllMaterialsRequest, registerMaterialRequest } from "../../services/warehouse/materialService.js";
import { createCrudApplication } from "../createCrudApplication.js";

const GOODS_RECEIPT_CREATION_CONTEXT = 'goodsReceipt';

export const materialApplication = createCrudApplication({
    requests: {
        getAll: getAllMaterialsRequest,
        register: async (options) =>  {

            const payload = {
                ...buildMaterialPayload(options.formData, {
                    includeMaxUnitCost: options.creationContext !== GOODS_RECEIPT_CREATION_CONTEXT
                }),
                ...(options.creationContext ? { creationContext: options.creationContext } : {})
            };

            return await registerMaterialRequest({ data: payload });
        },
        edit: editMaterialRequest
    },
    dataKey: 'material'
});

export const getMaterialOptions = async (params = {}) => {

    const response = await getAllMaterialsRequest({ params });

    const list = response.data?.data || [];

    return list.filter(material => material?.id && material?.name)
        .map(p => ({
            id: p.id,
            text: buildInventorySelectText(p)
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
    isActive: formData.isActive,
    ...Object.prototype.hasOwnProperty.call(formData, 'newStock') && { newStock: formData.newStock },
    ...Object.prototype.hasOwnProperty.call(formData, 'observations') && { observations: formData.observations }
});

export const registerMaterial = async ({
    formData,
    creationContext = null
}) => {

    const payload = {
        ...buildMaterialPayload(formData, {
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