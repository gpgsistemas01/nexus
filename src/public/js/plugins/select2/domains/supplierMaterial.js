import { getSupplierMaterialOptions } from "../../../application/warehouse/materials.js";
import { initbaseSelect2, toggleSelectOption } from "../baseSelect.js";
import { setSupplierMaterialSummaryValues } from "../../../modules/materials/supplierMaterialSummary.js";

const attachSupplierMaterialDisplayHandler = ({
    modalSelector,
    baseSelector
}) => {

    $(baseSelector)
        .off('.supplierMaterialDisplay')
        .on('select2:select.supplierMaterialDisplay', ({ params }) => {

            setSupplierMaterialSummaryValues({
                modalSelector,
                data: params?.data
            });
        })
        .on('select2:clear.supplierMaterialDisplay change.supplierMaterialDisplay', () => {

            const selectedValue = $(baseSelector).val();

            if (selectedValue) return;

            setSupplierMaterialSummaryValues({
                modalSelector,
                data: null
            });
        });
};

const initSupplierMaterialSelect = ({
    modalSelector,
    baseSelector,
    placeholder = 'Buscar material...'
}) => {

    initbaseSelect2({
        baseSelector,
        containerSelector: modalSelector,
        get: async (params) => ({
            data: await getSupplierMaterialOptions(params)
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

export const toggleSupplierMaterialOption = ({
    selector,
    data,
    modalSelector = null
}) => {

    toggleSelectOption({
        selector,
        data
    });

    if (!modalSelector) return;

    setSupplierMaterialSummaryValues({
        modalSelector,
        data
    });
};


export const setupSupplierMaterialSelect = ({
    modalSelector,
    materialSelector
}) => {

    const baseSelector = `${ modalSelector } ${ materialSelector }`;

    initSupplierMaterialSelect({
        modalSelector,
        baseSelector
    });

    attachSupplierMaterialDisplayHandler({
        modalSelector,
        baseSelector
    });
};
