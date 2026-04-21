import { initMdbWrapperInput, updateMdbWrapperInput } from "../mdb/baseInstance.js";
import { initbaseSelect2 } from "./baseSelect.js";

const modalSelector = '#goodsIssueModal';

export const initGoodsIssueFormSelect2 = async ({
    data = null,
    context
}) => {

    const requesterSelector = '#requesterInput';
    const projectSelector = '#projectInput';
    const productSelector = '#productInput';

    initbaseSelect2({
        baseSelector: requesterSelector,
        modalSelector,
        url: '/api/admin/profiles/',
        placeholder: 'Buscar solicitante...',
        data: (params) => {

            const canRequestAnyDepartment = context.department === 'Almacén' || context.role === 'Administrador del sistema';

            return {
                search: params.term,
                department: canRequestAnyDepartment ? '' : context.department
            };
        },
        processResults: (data) => {

            const list = data.data || data;

            return {
                results: list.map(profile => ({
                    id: profile.id,
                    text: `${ profile.name } ${ profile.lastName }`
                }))
            };
        }
    });

    initbaseSelect2({
        baseSelector: projectSelector,
        modalSelector,
        url: '/api/admin/projects/',
        placeholder: 'Buscar proyecto...',
        processResults: (data) => {

            const list = data.data || data;

            return {
                results: list.map(project => ({
                    id: project.id,
                    text: `${ project.referenceNumber } - ${ project.name }`
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
                    uom: product.presentation || 'PIEZA'
                }))
            };
        }
    });

    $(productSelector).on('select2:select', (e) => {

        const selectedProduct = e.params.data;
        const value = selectedProduct?.presentation || 'PIEZA';

        const instance = initMdbWrapperInput({ selector: '#presentationDisplayInput', value });
        updateMdbWrapperInput(instance);
    });

    if (data) {

        const requesterOption = new Option(
            `${ data.requester.name } ${ data.requester.lastName }`, 
            data.requester.id, 
            true, 
            true
        );
        $(requesterSelector).append(requesterOption).trigger('change');
        const projectOption = new Option(
            `${ data.project.referenceNumber }`, 
            data.project.id, 
            true, 
            true
        );
        $(projectSelector).append(projectOption).trigger('change');
        return;
    }

    $(requesterSelector).empty().trigger('change');
    $(projectSelector).empty().trigger('change');
};