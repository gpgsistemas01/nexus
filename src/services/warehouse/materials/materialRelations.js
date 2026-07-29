import { deleteSupplierMaterial, saveSupplierMaterial } from "./supplierMaterialService.js";


export const syncSupplierMaterial = async ({
    tx,
    supplierId,
    previousSupplierId = null,
    materialId,
    maxUnitCost
}) => {

    if (previousSupplierId && previousSupplierId !== supplierId) {
        await deleteSupplierMaterial({
            tx,
            materialId,
            supplierId: previousSupplierId
        });
    }

    return saveSupplierMaterial({
        tx,
        supplierId,
        materialId,
        maxUnitCost
    });
};
