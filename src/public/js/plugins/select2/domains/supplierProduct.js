import { getSupplierProductOptions } from "../../../application/warehouse/products.js";
import { initbaseSelect2, setMdbWrapperInputValue, toggleSelectOption } from "../baseSelect.js";
import { FORM_SELECTORS } from "../../../constants/selectors.js";

const presentationDisplaySelector = FORM_SELECTORS.PRESENTATION_DISPLAY;
const unitMeasureDisplaySelector = FORM_SELECTORS.UNIT_MEASURE_DISPLAY;

export const setSupplierProductDisplayValues = ({
    modalSelector,
    data = {}
}) => {

    setMdbWrapperInputValue({
        selector: `${ modalSelector } ${ presentationDisplaySelector }`,
        value: data.presentationName || ''
    });

    setMdbWrapperInputValue({
        selector: `${ modalSelector } ${ unitMeasureDisplaySelector }`,
        value: data.unitMeasureName || ''
    });
};

const attachSupplierProductDisplayHandler = ({
    modalSelector,
    baseSelector
}) => {

    $(baseSelector).off('select2:select.supplierProductDisplay').on('select2:select.supplierProductDisplay', ({ params }) => {

        setSupplierProductDisplayValues({
            modalSelector,
            data: params?.data
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

    setSupplierProductDisplayValues({
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
