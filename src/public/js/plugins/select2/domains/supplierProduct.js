import { getSupplierProductOptions } from "../../../application/warehouse/products.js";
import { initbaseSelect2, toggleSelectOption } from "../baseSelect.js";
import { setSupplierProductSummaryValues } from "../../../modules/products/supplierProductSummary.js";

const attachSupplierProductDisplayHandler = ({
    modalSelector,
    baseSelector
}) => {

    $(baseSelector)
        .off('.supplierProductDisplay')
        .on('select2:select.supplierProductDisplay', ({ params }) => {

            setSupplierProductSummaryValues({
                modalSelector,
                data: params?.data
            });
        })
        .on('select2:clear.supplierProductDisplay change.supplierProductDisplay', () => {

            const selectedValue = $(baseSelector).val();

            if (selectedValue) return;

            setSupplierProductSummaryValues({
                modalSelector,
                data: null
            });
        });
};

const initSupplierProductSelect = ({
    modalSelector,
    baseSelector,
    placeholder = 'Buscar producto...'
}) => {

    initbaseSelect2({
        baseSelector,
        containerSelector: modalSelector,
        get: async (params) => ({
            data: await getSupplierProductOptions(params)
        }),
        placeholder,
        data: (params) => ({
            search: params.term
        }),
        processResults: (data) => ({
            results: data.data || data
        })
    });
};

export const toggleSupplierProductOption = ({
    selector,
    data,
    modalSelector = null
}) => {

    toggleSelectOption({
        selector,
        data
    });

    if (!modalSelector) return;

    setSupplierProductSummaryValues({
        modalSelector,
        data
    });
};


export const setupSupplierProductSelect = ({
    modalSelector,
    productSelector
}) => {

    const baseSelector = `${ modalSelector } ${ productSelector }`;

    initSupplierProductSelect({
        modalSelector,
        baseSelector
    });

    attachSupplierProductDisplayHandler({
        modalSelector,
        baseSelector
    });
};
