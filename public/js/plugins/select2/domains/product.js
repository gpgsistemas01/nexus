import { openProductModal } from "../../../modules/products/productModal.js";
import { PRODUCTS_API_ROUTE } from "../../../services/warehouse/productService.js";
import { initbaseSelect2, setMdbWrapperInputValue, toggleSelectOption } from "../baseSelect.js";

const wrapperSelector = '#presentationDisplayInput';

const initProductSelect = ({ 
    modalSelector, 
    supplierSelector,
    baseSelector, 
    allowCreate = true 
}) => {

    initbaseSelect2({
        baseSelector,
        modalSelector,
        url: PRODUCTS_API_ROUTE,
        placeholder: 'Buscar producto...',
        data: (params) => {

            const supplierId = $(`${ modalSelector } ${ supplierSelector }`).val();

            return {
                search: params.term,
                supplierId: supplierId || ''
            };
        },
        processResults: (data) => {

            const list = data.data || data;

            return {
                results: list.map(p => {

                    let text;

                    if (!p.base || !p.height) text = p.name;
                    else text = `${ p.name } (${ p.base } x ${ p.height })`;

                    return {
                        id: p.id,
                        text,
                        presentation: p.presentation.name,
                        unitMeasure: p.unitMeasure.name,
                        base: p.base,
                        height: p.height
                    }
                })
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
            const [code, tradeName] = supplierName.split(' - ');

            if (!supplierId) {
                $(productSelector).val(null).trigger('change');
                alert('Selecciona primero un proveedor para crear productos.');
                return;
            }

            openProductModal({
                data: {
                    name,
                    supplier: {
                        id: supplierId,
                        tradeName,
                        code
                    }
                },
                onSave: (createdProduct) => {

                    toggleProductOption({
                        selector: productSelector,
                        data: {
                            id: createdProduct.id,
                            text: createdProduct.name
                        }
                    });

                    let text;

                    if (!createdProduct.base || !createdProduct.height) text = name;
                    else text = `${ createdProduct.name } (${ createdProduct.base } x ${ createdProduct.height })`;

                    $(productSelector).trigger({
                        type: 'select2:select',
                        params: {
                            data: {
                                id: createdProduct.id,
                                text,
                                presentation: createdProduct.presentation.name,
                                unitMeasure: createdProduct.unitMeasure.name,
                                base: createdProduct.base,
                                height: createdProduct.height
                            }
                        }
                    });

                    setMdbWrapperInputValue({
                        selector: wrapperSelector,
                        value: createdProduct.presentation.name
                    });
                }
            });

            return;
        }

        const value = selected.presentation;
        setMdbWrapperInputValue({
            selector: wrapperSelector,
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
    supplierSelector,
    productSelector,
}) => {

    initProductSelect({
        modalSelector,
        supplierSelector,
        baseSelector: `${ modalSelector } ${ productSelector }`,
    });

    attachProductHandler({
        modalSelector,
        productSelector: `${ modalSelector } ${ productSelector }`,
        supplierSelector
    });
};