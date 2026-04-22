import { initbaseSelect2 } from "./baseSelect.js";

const productModalSelector = '#productModal';
const supplierSelector = '#supplierInput';

export const initProductFormSelect2 = () => {

    initbaseSelect2({
        baseSelector: `${productModalSelector} ${supplierSelector}`,
        modalSelector: productModalSelector,
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
    
    $(supplierSelector).empty().trigger('change');

    if (!supplierId || !supplierName) return;

    const supplierOption = new Option(
        supplierName,
        supplierId,
        true,
        true
    );

    $(supplierSelector).append(supplierOption).trigger('change');
};