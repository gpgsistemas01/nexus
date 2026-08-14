import { editSupplierRequest, getAllSuppliersRequest, registerSupplierRequest } from "../../services/warehouse/supplierService.js";
import { createCrudApplication } from '../createCrudApplication.js';

const supplierApplication = createCrudApplication({
    requests: {
        getAll: getAllSuppliersRequest,
        register: registerSupplierRequest,
        edit: editSupplierRequest
    },
    dataKeys: { register: 'supplier' }
});

export const getSupplierOptions = async (params = {}) => {

    const response = await getAllSuppliersRequest({ params });

    const list = response.data?.data || [];

    return list.filter(supplier => supplier?.id && supplier?.tradeName)
        .map(supplier => ({
            value: supplier.id,
            label: supplier.tradeName
        }));
}

export const getAllSuppliers = supplierApplication.getAll;
export const registerSupplier = supplierApplication.register;
export const editSupplier = supplierApplication.edit;
