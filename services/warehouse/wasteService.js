import { GoodsIssueInsufficientStock } from '../../errors/inventory/stockError.js';
import { createStockAdjustment } from './adjustmentService.js';
import { findSupplierProductByIds } from './products/supplierProductService.js';

export const createWasteAdjustment = async ({
    wasteDto,
    userId
}) => {

    const product = await findSupplierProductByIds(wasteDto);

    const previousStock = Number(product.currentStock || 0);
    const newStock = previousStock - wasteDto.quantity;

    if (newStock < 0) {
        throw new GoodsIssueInsufficientStock({
            productName: product.name,
            height: product.height,
            base: product.base,
            supplierName: product.supplier?.tradeName
        });
    }

    return createStockAdjustment({
        ...wasteDto,
        newStock,
        userId
    });
};
