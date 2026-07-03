import { openProductModal } from "../../../modules/products/productModal.js";
import { getAllProducts, getProductOptions } from "../../../application/warehouse/products.js";
import { initbaseSelect2, setMdbWrapperInputValue, toggleSelectOption } from "../baseSelect.js";
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

    initbaseSelect2({
        baseSelector: productSelector,
        containerSelector: baseSelector,
        get: async (params) => ({
            data: await getProductOptions(params)
        }),
        clearOnOpen: false,
        placeholder: 'Filtrar por producto',
        data: (params) => {

            let supplierId;

            if (supplierFilterSelector) supplierId = $(`${ baseSelector } ${ supplierFilterSelector }`).val();
            else supplierId = ''

            return {
                search: params.term,
                supplierId
            };
        },
        processResults: (data) => {

            const list = data.data || data;
            
            return {
                results: list.map(p => ({
                    ...p
                }))
            };
        }
    });

    if (!selectedId) return;

    const currentOption = $(`${ productSelector } option[value=\"${ selectedId }\"]`);

    if (currentOption.length) $(productSelector).val(selectedId).trigger('change');
};

const initProductSelect = ({ 
    modalSelector, 
    supplierSelector,
    baseSelector, 
    allowCreate = true 
}) => {

    initbaseSelect2({
        baseSelector,
        containerSelector: modalSelector,
        get: getAllProducts,
        placeholder: 'Buscar producto...',
        data: (params) => {

            let supplierId;

            if (supplierSelector) supplierId = $(`${ modalSelector } ${ supplierSelector }`).val();
            else supplierId = ''

            return {
                search: params.term,
                supplierId
            };
        },
        processResults: (data) => {

            const list = data.data || data;

            return {
                results: list.map(mapProductToSelectData)
            };
        },
        ...(allowCreate && {
            tags: true,
            createTag: (params) => {

                const term = params.term.trim();

                if (!term) return null;

                return {
                    id: `new:${ term }`,
                    text: `${ term } (Nuevo producto)`,
                    newTag: true
                };
            }
        })
    });
};

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
    productCreationContext = null
}) => {

    const baseSelector = `${ modalSelector } ${ productSelector }`;

    initProductSelect({
        modalSelector,
        supplierSelector,
        baseSelector,
        allowCreate
    });

    attachProductHandler({
        modalSelector,
        baseSelector,
        supplierSelector,
        includeStockAdjustmentOnCreate,
        productCreationContext
    });
};
