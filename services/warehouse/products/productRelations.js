import { createSupplierProduct, deleteSupplierProduct } from "./supplierProductService.js";

export const syncSupplierProduct = async ({
    tx,
    supplierId,
    productId,
    sku,
    supplierCode,
    isUpdate = false
}) => {

    if (isUpdate) {
        await deleteSupplierProduct({
            tx,
            productId,
            supplierId
        });
    }

    await createSupplierProduct({
        tx,
        supplierId,
        productId,
        skuProduct: sku,
        skuSupllier: supplierCode
    });
};