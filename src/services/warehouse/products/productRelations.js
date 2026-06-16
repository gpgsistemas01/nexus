import { deleteSupplierProduct, saveSupplierProduct } from "./supplierProductService.js";


export const syncSupplierProduct = async ({
    tx,
    supplierId,
    previousSupplierId = null,
    productId,
    maxUnitCost
}) => {

    if (previousSupplierId && previousSupplierId !== supplierId) {
        await deleteSupplierProduct({
            tx,
            productId,
            supplierId: previousSupplierId
        });
    }

    return saveSupplierProduct({
        tx,
        supplierId,
        productId,
        maxUnitCost
    });
};
