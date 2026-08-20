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

export const getAllSuppliers = supplierApplication.getAll;
export const registerSupplier = supplierApplication.register;
export const editSupplier = supplierApplication.edit;
