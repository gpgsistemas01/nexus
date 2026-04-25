import { openSupplierModal } from "../../../modules/suppliers/supplierModal.js";
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
                results: list.map(s => ({
                    id: s.id,
                    text: `${ s.code } - ${ s.tradeName }`,
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

const attachSupplierHandler = ({ supplierSelector }) => {

    $(supplierSelector).off('select2:select').on('select2:select', (e) => {

        const selected = e.params.data;

        if (selected.newTag) {

            const tradeName = selected.id.replace('new:', '');

            openSupplierModal({
                data: { tradeName },
                onSave: (createdsupplier) => {

                    const option = new Option(
                        createdsupplier.tradeName,
                        createdsupplier.id,
                        true,
                        true
                    );
                    $(supplierSelector).append(option).trigger('change');
                }
            });

            return;
        }
    });
};

export const toggleSupplierOption = ({ 
    selector, 
    id = null, 
    name = null
}) => toggleSelectOption({
    selector,
    id,
    name,
});

export const setupSupplierSelect = ({ 
    modalSelector, 
    supplierSelector
}) => {

    initSupplierSelect({
        modalSelector,
        baseSelector: `${ modalSelector } ${ supplierSelector }`,
    });

    attachSupplierHandler({
        supplierSelector: `${ modalSelector } ${ supplierSelector }`
    });
};