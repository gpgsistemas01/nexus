import { PRODUCT_SELECT_RESULTS_LIMIT } from "../../../application/warehouse/products.js";
import { setupProductSelect, toggleProductOption } from "../domains/product.js";

const modalSelector = '#goodsReceiptCorrectionModal';
const productSelector = '#correctionProductInput';
const supplierSelector = '#correctionSupplierInput';

export const initGoodsReceiptCorrectionSelect2 = ({ detail }) => {
    setupProductSelect({
        modalSelector,
        supplierSelector,
        productSelector,
        allowCreate: false,
        resultsLimit: PRODUCT_SELECT_RESULTS_LIMIT
    });

    toggleProductOption({
        selector: `${ modalSelector } ${ productSelector }`,
        data: {
            id: detail.productId || detail.product?.id,
            text: detail.productName || detail.product?.name
        }
    });
};
