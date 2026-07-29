import { initMdbWrapperInput, updateMdbWrapperInput } from "../../mdb/baseInstance.js";
import { initbaseSelect2 } from "../baseSelect.js";
import { FORM_SELECTORS, MODAL_SELECTORS } from "../../../constants/selectors.js";

const modalSelector = MODAL_SELECTORS.PURCHASE_REQUISITION;
const projectSelector = FORM_SELECTORS.PROJECT;
const requesterSelector = FORM_SELECTORS.REQUESTER;
const materialSelector = FORM_SELECTORS.MATERIAL;
const projectScopedSelector = `${ modalSelector } ${ projectSelector }`;
const requesterScopedSelector = `${ modalSelector } ${ requesterSelector }`;
const materialScopedSelector = `${ modalSelector } ${ materialSelector }`;
const presentationDisplayScopedSelector = `${ modalSelector } ${ FORM_SELECTORS.PRESENTATION_DISPLAY }`;

export const initPurchaseRequisitionFormSelect2 = async (data = null) => {

    initbaseSelect2({
        baseSelector: projectScopedSelector,
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
        baseSelector: requesterScopedSelector,
        modalSelector,
        url: '/api/admin/profiles/',
        placeholder: 'Buscar solicitante...',
        processResults: (data) => {

            const list = data.data || data;
            return {
                results: list.map(requester => ({
                    id: requester.id,
                    text: `${ requester.name } ${ requester.lastName }`
                }))
            };
        }
    });

    initbaseSelect2({
        baseSelector: materialScopedSelector,
        modalSelector,
        url: '/api/warehouse/materials/',
        placeholder: 'Buscar material...',
        processResults: (data) => {

            const list = data.data || data;
            return {
                results: list.map(material => ({
                    id: material.id,
                    text: material.name,
                    uom: material.presentation || 'PIEZA'
                }))
            };
        }
    });

    $(materialScopedSelector).on('select2:select', (e) => {

        const selectedMaterial = e.params.data;
        const value = `PIEZA(${selectedMaterial?.presentation || 'PIEZA'})`;

        const instance = initMdbWrapperInput({ selector: presentationDisplayScopedSelector, value });
        updateMdbWrapperInput(instance);
    });

    if (data) {

        const projectOption = new Option(
            `${ data.project.referenceNumber } - ${ data.project.name }`,
            data.project.id,
            true,
            true
        );
        $(projectScopedSelector).append(projectOption).trigger('change');

        const requesterOption = new Option(
            `${ data.requester.name } ${ data.requester.lastName }`,
            data.requester.id,
            true,
            true
        );
        $(requesterScopedSelector).append(requesterOption).trigger('change');

    } else {

        $(projectScopedSelector).empty().trigger('change');
        $(requesterScopedSelector).empty().trigger('change');
    }
};
