import { openProductModal } from "../../../modules/products/productModal.js";
import { getAllProducts, getProductOptions } from "../../../application/warehouse/products.js";
import { initDomainSelect2, initFilterSelect2, setMdbWrapperInputValue, toggleSelectOption } from "../baseSelect.js";
import { mapProductToSelectData } from "../../../utils/productSelectUtils.js";
import { FORM_SELECTORS, FILTER_SELECTORS } from "../../../constants/selectors.js";

const wrapperSelector = FORM_SELECTORS.PRESENTATION_DISPLAY;
const productSelector = FILTER_SELECTORS.PRODUCT;

export const getProductSelectApi = () => ({
    getSelect: () => document.querySelector(productSelector),
    getValue: () => document.querySelector(productSelector)?.value || ''
});

export const initProductFilterSelect = ({
    selectedId = null,
    supplierFilterSelector = null
}) => {

    const baseSelector = 'body';

    initFilterSelect2({
        selector: productSelector,
        getOptions: getProductOptions,
        placeholder: 'Filtrar por producto',
        selectedId,
        data: (params) => {

            let supplierId;

            if (supplierFilterSelector) supplierId = $(`${ baseSelector } ${ supplierFilterSelector }`).val();
            else supplierId = ''

            const page = Number(params.page) || 1;
            const length = 20;

            return {
                search: params.term,
                supplierId,
                start: (page - 1) * length,
                length
            };
        },
        processResults: (data, params) => {

            const page = Number(params.page) || 1;
            const list = data.data || data;
            const recordsFiltered = Number(data.recordsFiltered) || list.length;
            const length = Number(params?.data?.length) || 20;
            
            return {
                results: list.map(p => ({
                    ...p
                })),
                pagination: {
                    more: page * length < recordsFiltered
                }
            };
        }
    });
};

const initProductSelect = ({ 
    modalSelector, 
    supplierSelector,
    baseSelector, 
    allowCreate = true,
    resultsLimit = null
}) => initDomainSelect2({
    selector: baseSelector,
    containerSelector: modalSelector,
    get: getAllProducts,
    placeholder: 'Buscar producto...',
    data: (params) => {

        let supplierId;

        if (supplierSelector) supplierId = $(`${ modalSelector } ${ supplierSelector }`).val();
        else supplierId = ''

        const page = Number(params.page) || 1;

        return {
            search: params.term,
            supplierId,
            ...(resultsLimit ? {
                start: (page - 1) * resultsLimit,
                length: resultsLimit
            } : {})
        };
    },
    processResults: (data, params) => {

        const page = Number(params.page) || 1;
        const list = data.data || data;
        const recordsFiltered = Number(data.recordsFiltered) || list.length;
        const length = resultsLimit || list.length;

        return {
            results: list.map(mapProductToSelectData),
            pagination: {
                more: Boolean(resultsLimit) && page * length < recordsFiltered
            }
        };
    },
    allowCreate,
    newTagLabel: 'Nuevo producto'
});

const attachProductHandler = ({ 
    modalSelector,
    baseSelector, 
    supplierSelector,
    includeStockAdjustmentOnCreate = true,
    productCreationContext = null
}) => {

    $(baseSelector).off('select2:select').on('select2:select', (e) => {

        const { data } = e.params;

        if (data.newTag) {

            const name = data.id.replace('new:', '');
            const id = $(`${ modalSelector } ${ supplierSelector }`).val();
            const tradeName = $(`${ modalSelector } ${ supplierSelector } option:selected`).text();

            openProductModal({
                data: {
                    name,
                    supplier: {
                        id,
                        tradeName,
                    }
                },
                includeStockAdjustmentOnCreate,
                creationContext: productCreationContext,
                onSave: (createdProduct) => {

                    toggleProductOption({
                        selector: baseSelector,
                        data: mapProductToSelectData(createdProduct)
                    });
                    
                    setMdbWrapperInputValue({
                        selector: `${ modalSelector } ${ wrapperSelector }`,
                        value: createdProduct.presentation.name
                    });
                }
            });

            return;
        }

        const option = e.target.querySelector('option:checked');

        if (!option) return;

        Object.entries(data).forEach(([key, value]) => {
            option.dataset[key] = value;
        });

        const value = data.presentationName || '';

        setMdbWrapperInputValue({
            selector: `${ modalSelector } ${ wrapperSelector }`,
            value
        });
    });
};

export const toggleProductOption = ({ 
    selector, 
    data
}) => toggleSelectOption({
    selector,
    data
});


export const setupProductSelect = ({ 
    modalSelector, 
    supplierSelector = null,
    productSelector,
    allowCreate = true,
    includeStockAdjustmentOnCreate = true,
    productCreationContext = null,
    resultsLimit = null
}) => {

    const baseSelector = `${ modalSelector } ${ productSelector }`;

    initProductSelect({
        modalSelector,
        supplierSelector,
        baseSelector,
        allowCreate,
        resultsLimit
    });

    attachProductHandler({
        modalSelector,
        baseSelector,
        supplierSelector,
        includeStockAdjustmentOnCreate,
        productCreationContext
    });
};
