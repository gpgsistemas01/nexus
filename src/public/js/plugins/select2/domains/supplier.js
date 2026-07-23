import { openSupplierModal } from "../../../modules/suppliers/supplierModal.js";
import { getAllSuppliers, getSupplierOptions } from "../../../application/warehouse/suppliers.js";
import { initDomainSelect2, initFilterSelect2, toggleSelectOption } from "../baseSelect.js";
import { FILTER_SELECTORS } from "../../../constants/selectors.js";

const supplierSelector = FILTER_SELECTORS.SUPPLIER;

export const getSupplierSelectApi = () => ({
    getSelect: () => document.querySelector(supplierSelector),
    getValue: () => document.querySelector(supplierSelector)?.value || ''
});

export const initSupplierFilterSelect = ({
    selectedId = null
}) => initFilterSelect2({
    selector: supplierSelector,
    getOptions: getSupplierOptions,
    placeholder: 'Filtrar por proveedor',
    selectedId
});

const initSupplierSelect = ({ 
    modalSelector, 
    baseSelector, 
    allowCreate = true
}) => initDomainSelect2({
    selector: baseSelector,
    containerSelector: modalSelector,
    get: getAllSuppliers,
    placeholder: 'Buscar proveedor...',
    mapOption: (supplier) => ({
        id: supplier.id,
        text: `${ supplier.tradeName }`,
    }),
    allowCreate,
    newTagLabel: 'Nuevo proveedor'
});

const attachSupplierHandler = ({ supplierSelector }) => {

    $(supplierSelector).off('select2:select').on('select2:select', (e) => {

        const selected = e.params.data;

        if (selected.newTag) {

            const tradeName = selected.id.replace('new:', '');

            openSupplierModal({
                data: { tradeName },
                onSave: (createdsupplier) => {

                    toggleSupplierOption({
                        selector: supplierSelector,
                        id: createdsupplier.id,
                        name: `${ createdsupplier.tradeName }`
                    });
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
    data: {
        id,
        text: name
    }
});

export const setupSupplierSelect = ({ 
    modalSelector, 
    supplierSelector,
    allowCreate = true
}) => {

    initSupplierSelect({
        modalSelector,
        baseSelector: `${ modalSelector } ${ supplierSelector }`,
        allowCreate
    });

    attachSupplierHandler({
        supplierSelector: `${ modalSelector } ${ supplierSelector }`
    });
};
