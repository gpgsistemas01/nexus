import { initbaseSelect2 } from "./baseSelect.js";

const modalSelector = '#productModal';
const supplierSelector = '.supplier-select';

export const initProductFormSelect2 = () => {

    initbaseSelect2({
        baseSelector: `${modalSelector} ${supplierSelector}`,
        modalSelector: modalSelector,
        url: '/api/warehouse/suppliers/',
        placeholder: 'Buscar proveedor...',
        processResults: (data) => {
            
            const list = data.data || data;
            
            return {
                results: list.map((supplier) => ({
                    id: supplier.id,
                    text: `${supplier.code} - ${supplier.tradeName}`,
                    code: supplier.code
                }))
            };
        }
    });
};

export const setSupplierOption = ({ supplierId = null, supplierName = null } = {}) => {
    
    $(`${modalSelector} ${supplierSelector}`).empty().trigger('change');

    if (!supplierId || !supplierName) return;

    const supplierOption = new Option(
        supplierName,
        supplierId,
        true,
        true
    );

    $(`${modalSelector} ${supplierSelector}`).append(supplierOption).trigger('change');
};