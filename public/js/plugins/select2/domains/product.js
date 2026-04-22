import { PRODUCTS_API_ROUTE } from "../../../services/warehouse/productService.js";
import { initbaseSelect2, toggleSelectOption } from "../baseSelect.js";


export const initProductSelect = ({ 
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
                    presentation: p.presentation || 'PIEZA'
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

export const attachProductHandler = ({ productSelector, openModal, onSelect }) => {

    $(productSelector).off('select2:select').on('select2:select', (e) => {

        const selected = e.params.data;

        if (selected.newTag) {

            const name = selected.id.replace('new:', '');

            openModal(name, (createdProduct) => {
                const option = new Option(
                    createdProduct.name,
                    createdProduct.id,
                    true,
                    true
                );
                $(productSelector).append(option).trigger('change');
            });

            return;
        }

        onSelect?.(selected);
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