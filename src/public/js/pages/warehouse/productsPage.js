import { createProductDatatable } from "../../plugins/datatable/productDatatable.js";
import { openStockAdjustmentModal } from "../../modules/products/productModal.js";
import { setProductReasonVisualOption } from "../../plugins/select2/modules/productSelect.js";
import { MODAL_SELECTORS } from "../../constants/selectors.js";

const context = window.meta || {};
const returnReasonName = 'Devolución';

const openProductReturnModal = ({ data }) => {

    openStockAdjustmentModal({
        mode: 'return-product',
        data,
        title: 'Devolver producto',
        submitText: 'Devolver',
        beforeOpen: ({ form }) => {
            form.elements.newStock.value = '';

            setProductReasonVisualOption({
                modalSelector: MODAL_SELECTORS.PRODUCT,
                name: returnReasonName,
                isDisabled: true
            });
        }
    });
};

createProductDatatable(context, {
    onReturnProduct: openProductReturnModal
});
