import { openProductModal } from "../../../modules/products/productModal.js";
import { PRODUCTS_API_ROUTE } from "../../../services/warehouse/productService.js";
import { initMdbWrapperInput, updateMdbWrapperInput } from "../../mdb/baseInstance.js";
import { initbaseSelect2, toggleSelectOption } from "../baseSelect.js";

const initProductSelect = ({ 
    modalSelector, 
    baseSelector, 
    allowCreate = true 
}) => {

    initbaseSelect2({
        baseSelector,
        modalSelector,
        url: PRODUCTS_API_ROUTE,
        placeholder: 'Buscar producto...',
        processResults: (data) => {

            const list = data.data || data;

            return {
                results: list.map(p => ({
                    id: p.id,
                    text: p.name,
                    presentation: p.presentation.name || 'PIEZA',
                    unitMeasure: p.unitMeasure.name,
                }))
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
    productSelector, 
    supplierSelector
}) => {

    $(productSelector).off('select2:select').on('select2:select', (e) => {

        const selected = e.params.data;

        if (selected.newTag) {

            const name = selected.id.replace('new:', '');
            const supplierId = $(`${ modalSelector } ${ supplierSelector }`).val();
            const supplierName = $(`${ modalSelector } ${ supplierSelector } option:selected`).text();

            openProductModal({
                data: {
                    name,
                    supplierId,
                    supplierName
                },
                onSave: (createdProduct) => {

                    const option = new Option(
                        createdProduct.tradeName,
                        createdProduct.id,
                        true,
                        true
                    );
                    $(productSelector).append(option).trigger('change');
                }
            });

            return;
        }

        const value = selected.presentation;
        const instance = initMdbWrapperInput({
            selector: '#presentationDisplayInput',
            value
        });

        updateMdbWrapperInput(instance);
    });
};

export const toggleProductOption = ({ 
    selector, 
    id = null, 
    name = null 
}) => toggleSelectOption({
    selector,
    id,
    name,
});

export const setupProductSelect = ({ 
    modalSelector, 
    supplierSelector,
    productSelector,
}) => {

    initProductSelect({
        modalSelector,
        baseSelector: `${ modalSelector } ${ productSelector }`,
    });

    attachProductHandler({
        modalSelector,
        productSelector: `${ modalSelector } ${ productSelector }`,
        supplierSelector
    });
};