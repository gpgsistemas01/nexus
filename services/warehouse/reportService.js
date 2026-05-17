import { getDb } from "../../repository/baseRepository.js";

const mapProductRows = (products = []) => products.map((item) => ({
    material: item.product?.name,
    base: item.product?.base,
    altura: item.product?.height,
    existencia: item.currentStock,
    stockMinimo: item.product?.minStock,
    presentacion: item.product?.presentation?.name,
    cantidadConversion: item.convertedQuantity,
    unidad: item.product?.unitMeasure?.name,
    costoUnitarioConversion: item.maxUnitCost
}));

export const findWarehouseReportRows = async () => {

    const rows = await getDb().supplierProduct.findMany({
        where: { product: { isActive: true } },
        include: {
            product: {
                include: {
                    presentation: true,
                    unitMeasure: true
                }
            }
        },
        orderBy: { product: { name: 'asc' } }
    });

    return mapProductRows(rows);
};
