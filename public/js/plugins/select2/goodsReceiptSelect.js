import { openProductModal } from "../../components/modals/productModal.js";
import { cleanAddedProduct } from "../../pages/warehouse/goodsReceiptsPage.js";
import { initMdbWrapperInput, updateMdbWrapperInput } from "../mdb/baseInstance.js";
import { initbaseSelect2 } from "./baseSelect.js";

const modalSelector = '#goodsReceiptModal';

export const initGoodsReceiptSelect2 = async (data = null) => {

    const supplierSelector = '#supplierInput';
    const receivedBySelector = '#receivedByInput';
    const productSelector = '#productInput';

    initbaseSelect2({
        baseSelector: supplierSelector,
        modalSelector,
        url: '/api/warehouse/suppliers/',
        placeholder: 'Buscar proveedor...',
        processResults: (data) => {
            
            const list = data.data || data;
            return { 
                results: list.map(supplier => ({ 
                    id: supplier.id, 
                    text: supplier.tradeName 
                })) 
            }; 
        }
    });

    initbaseSelect2({
        baseSelector: receivedBySelector,
        modalSelector,
        url: '/api/admin/profiles/',
        placeholder: 'Buscar persona que recibe...',
        data: (params) => {
            return {
                search: params.term,
                department: 'Almacén',
                strictDepartmentFilter: true
            };
        },
        processResults: (data) => {
            
            const list = data.data || data;
            return { 
                results: list.map(receivedBy => ({ 
                    id: receivedBy.id, 
                    text: `${ receivedBy.name } ${ receivedBy.lastName }`
                })) 
            }; 
        }
    });

    initbaseSelect2({
        baseSelector: productSelector,
        modalSelector,
        url: '/api/warehouse/products/',
        placeholder: 'Buscar producto...',
        processResults: (data) => {

            const list = data.data || data;
            return { 
                results: list.map(product => ({
                    id: product.id,
                    text: product.name,
                    presentation: product.presentation || 'PIEZA',
                    base: product.base,
                    height: product.height
                })) 
            }; 
        },
        tags: true,
        createTag: (params) => {
            const term = params.term.trim();

            if (term === '') return null;

            return {
                id: `new:${term}`,
                text: `${term} (Nuevo producto)`,
                newTag: true
            }
        },
    });

    $(productSelector).on('select2:select', (e) => {
    
        const selectedProduct = e.params.data;

        if (selectedProduct.newTag) {

            const tempValue = selectedProduct.id;
            const productName = tempValue.replace('new:', '');

            cleanAddedProduct()
            openProductModal({ 
                mode: 'create', 
                data: { name: productName },
                onSave: (createdProduct) => {
                    const newOption = new Option(
                        createdProduct.name, 
                        createdProduct.id, 
                        true, 
                        true
                    );
                    $(productSelector).append(newOption).trigger('change');
                }
            });
            
            return;
        }

        const value = `PIEZA(${selectedProduct?.presentation || 'PIEZA'})`;

        const instance = initMdbWrapperInput({ selector: '#presentationDisplayInput', value });
        updateMdbWrapperInput(instance);
    });

    if (data) {

        const supplierOption = new Option(
            data.supplier.tradeName, 
            data.supplier.id, 
            true, 
            true
        );
        $(supplierSelector).append(supplierOption).trigger('change');
        const receivedByOption = new Option(
            `${data.receivedBy.name} ${data.receivedBy.lastName}`, 
            data.receivedBy.id, 
            true, 
            true
        );
        $(receivedBySelector).append(receivedByOption).trigger('change');

    } else {

        $(supplierSelector).empty().trigger('change');
        $(receivedBySelector).empty().trigger('change');
    }
}
