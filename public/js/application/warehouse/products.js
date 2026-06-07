import { getSuccessMessage } from "../../constants/apiMessages.js";
import { buildProductSelectText } from "../../utils/productSelectUtils.js";
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

    const { data } = response;
    const { code, product } = data;
    let message = withInitialStockAdjustment
        ? '¡Producto creado y stock registrado exitosamente!'
        : getSuccessMessage(code);

    return {
        message,
        data: product
    };
}

export const editProduct = async ({ formData, id }) => {

    const response = await editProductRequest({ data: formData, id });

    const { data } = response;
    const { code } = data;
    let message = getSuccessMessage(code);

    return {
        message
    };
}

export const editProductStock = async ({ formData, id }) => {

    const response = await editProductStockRequest({ data: formData, id });

    const { data } = response;
    const { code } = data;
    let message = getSuccessMessage(code);

    return {
        message
    };
}