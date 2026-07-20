import { getSupplierProductOptions } from "../../../application/warehouse/products.js";
import { initbaseSelect2, toggleSelectOption } from "../baseSelect.js";
import { FORM_SELECTORS } from "../../../constants/selectors.js";

const supplierSummarySelector = FORM_SELECTORS.SELECTED_PRODUCT_SUPPLIER;
const presentationSummarySelector = FORM_SELECTORS.SELECTED_PRODUCT_PRESENTATION;
const unitMeasureSummarySelector = FORM_SELECTORS.SELECTED_PRODUCT_UNIT_MEASURE;
const baseSummarySelector = FORM_SELECTORS.SELECTED_PRODUCT_BASE;
const heightSummarySelector = FORM_SELECTORS.SELECTED_PRODUCT_HEIGHT;

const setSummaryText = ({ selector, value }) => {
    const element = document.querySelector(selector);

    if (!element) return;

    const displayValue = value || '-';

    element.textContent = displayValue;
    element.dataset.value = displayValue;
};

export const setSupplierProductDisplayValues = ({
    modalSelector,
    data = {}
}) => {

    setSummaryText({
        selector: `${ modalSelector } ${ supplierSummarySelector }`,
        value: data.supplierName
    });

    setSummaryText({
        selector: `${ modalSelector } ${ presentationSummarySelector }`,
        value: data.presentationName
    });

    setSummaryText({
        selector: `${ modalSelector } ${ unitMeasureSummarySelector }`,
        value: data.unitMeasureName
    });

    setSummaryText({
        selector: `${ modalSelector } ${ baseSummarySelector }`,
        value: data.productBase
    });

    setSummaryText({
        selector: `${ modalSelector } ${ heightSummarySelector }`,
        value: data.productHeight
    });
};

const attachSupplierProductDisplayHandler = ({
    modalSelector,
    baseSelector
}) => {

    $(baseSelector)
        .off('.supplierProductDisplay')
        .on('select2:select.supplierProductDisplay', ({ params }) => {

            setSupplierProductDisplayValues({
                modalSelector,
                data: params?.data
            });
        })
        .on('select2:clear.supplierProductDisplay change.supplierProductDisplay', () => {

            const selectedValue = $(baseSelector).val();

            if (selectedValue) return;

            setSupplierProductDisplayValues({
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
