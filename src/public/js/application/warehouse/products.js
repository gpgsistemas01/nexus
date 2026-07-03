import { createSuccessResponseFromRequest } from "../../utils/responseUtils.js";
import { buildProductSelectText, mapSupplierProductToSelectData } from "../../utils/productSelectUtils.js";
import { editProductRequest, editProductStockRequest, getAllProductsRequest, registerProductRequest } from "../../services/warehouse/productService.js";

export const getProductOptions = async (params = {}) => {

    const response = await getAllProductsRequest({ params });

    const list = response.data?.data || [];

    return list.filter(product => product?.id && product?.name)
        .map(p => ({
            id: p.id,
            text: buildProductSelectText(p)
        }));
}


export const getSupplierProductOptions = async (params = {}) => {

    const response = await getAllProductsRequest({ params });

    const list = response.data?.data || [];

    return list
        .filter(product => product?.supplierProductId && product?.name)
        .map(mapSupplierProductToSelectData);
}

export const getAllProducts = async (params = {}) => {

    const response = await getAllProductsRequest({ params });

    return response;
};

const buildProductPayload = (formData) => ({
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

const buildStockPayload = (formData) => ({
    supplierId: formData.supplierId,
    newStock: formData.newStock,
    reasonId: formData.reasonId,
    observations: formData.observations
});

export const registerProduct = async ({
    formData,
    withInitialStockAdjustment = false,
    creationContext = null
}) => {

    const payload = {
        ...buildProductPayload(formData),
        ...(creationContext ? { creationContext } : {}),
        ...(withInitialStockAdjustment ? buildStockPayload(formData) : {})
    };

    const response = await registerProductRequest({ data: payload });
    const message = withInitialStockAdjustment
        ? '¡Producto creado y stock registrado exitosamente!'
        : null;

    return createSuccessResponseFromRequest({
        response,
        dataKey: 'product',
        message
    });
}

export const editProduct = async ({ formData, id }) => {

    const response = await editProductRequest({ data: formData, id });

    return createSuccessResponseFromRequest({ response });
}

export const editProductStock = async ({ formData, id }) => {

    const response = await editProductStockRequest({ data: formData, id });

    return createSuccessResponseFromRequest({ response });
}
