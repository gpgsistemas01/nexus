import { SUPPLIERS_API_ROUTE } from "../../../services/warehouse/supplierService.js";
import { initbaseSelect2, toggleSelectOption } from "../baseSelect.js";

const initSupplierSelect = ({ 
    modalSelector, 
    baseSelector, 
    allowCreate = true
}) => {

    initbaseSelect2({
        baseSelector,
        modalSelector,
        url: SUPPLIERS_API_ROUTE,
        placeholder: 'Buscar proveedor...',
        processResults: (data) => {

            const list = data.data || data;

            return {
                results: list.map(p => ({
                    id: p.id,
                    text: p.tradeName,
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
                    text: `${ term } (Nuevo proveedor)`,
                    newTag: true
                };
            }
        })
    });
};

const attachSupplierHandler = ({ supplierSelector, openModal }) => {

    $(supplierSelector).off('select2:select').on('select2:select', (e) => {

        const selected = e.params.data;

        if (selected.newTag) {

            const name = selected.id.replace('new:', '');

            openModal(name, (createdsupplier) => {
                const option = new Option(
                    createdsupplier.name,
                    createdsupplier.id,
                    true,
                    true
                );
                $(supplierSelector).append(option).trigger('change');
            });

            return;
        }
    });
};

export const toggleSupplierOption = ({ 
    selector, 
    supplierId = null, 
    supplierName = null
}) => toggleSelectOption({
    selector,
    id: supplierId,
    name: supplierName,
});

export const setupSupplierSelect = ({ 
    modalSelector, 
    supplierSelector, 
    openModal 
}) => {

    initSupplierSelect({
        modalSelector,
        baseSelector: `${ modalSelector } ${ supplierSelector }`,
    });

    attachSupplierHandler({
        supplierSelector: `${ modalSelector } ${ supplierSelector }`,
        openModal
    });
};