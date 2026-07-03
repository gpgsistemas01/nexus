import { createSuccessResponseFromRequest } from "../../utils/responseUtils.js";
import { editSupplierRequest, getAllSuppliersRequest, registerSupplierRequest } from "../../services/warehouse/supplierService.js";

export const getSupplierOptions = async (params = {}) => {

    const response = await getAllSuppliersRequest({ params });

    const list = response.data?.data || [];

    return list.filter(supplier => supplier?.id && supplier?.tradeName)
        .map(supplier => ({
            value: supplier.id,
            label: supplier.tradeName
        }));
}

export const getAllSuppliers = async (params = {}) => {

    const response = await getAllSuppliersRequest({ params });

    return response;
};

export const registerSupplier = async ({ formData }) => {

    const response = await registerSupplierRequest({ data: formData });

    return createSuccessResponseFromRequest({ response, dataKey: 'supplier' });
}

export const editSupplier = async ({ formData, id }) => {

    const response = await editSupplierRequest({ data: formData, id });

    return createSuccessResponseFromRequest({ response });
}
