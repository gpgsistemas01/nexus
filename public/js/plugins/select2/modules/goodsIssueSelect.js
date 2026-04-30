import { bindChangeResetSelect } from "../../../utils/domUtils.js";
import { initClientSelect, toggleClientOption } from "../domains/client.js";
import { initDepartmentSelect, toggleDepartmentOption } from "../domains/department.js";
import { setupProductSelect, toggleProductOption } from "../domains/product.js";
import { initProfileSelect, toggleProfileOption } from "../domains/profile.js";

const modalSelector = '#goodsIssueModal';
const requesterSelector = '#requesterInput';
const clientSelector = '#clientInput';
const departmentSelector = '#departmentInput';
const advisorSelector = '#advisorInput';
const productSelector = '#productInput';

export const initGoodsIssueFormSelect2 = ({
    context
}) => {
    initDepartmentSelect({
        modalSelector,
        baseSelector: `${ modalSelector } ${ departmentSelector }`,
        allowCreate: false
    });

    initClientSelect({
        modalSelector,
        advisorSelector,
        baseSelector: `${ modalSelector } ${ clientSelector }`,
        allowCreate: false
    });

    initProfileSelect({
        modalSelector, 
        baseSelector: `${ modalSelector } ${ advisorSelector }`,
        placeholder: 'Buscar asesor...',
        data: (params) => {

            return {
                search: params.term,
                department: 'VENTAS Y PROYECTOS ESPECIALES',
                strictDepartmentFilter: true
            };
        },
        allowCreate: false,
    });

    initProfileSelect({
        modalSelector, 
        baseSelector: `${ modalSelector } ${ requesterSelector }`,
        placeholder: 'Buscar solicitante...',
        data: (params) => {

            const select = document.querySelector(`${modalSelector} ${departmentSelector}`);
            const department = select?.selectedOptions[0]?.text.trim();

            return {
                search: params.term,
                department,
                strictDepartmentFilter: true
            };
        },
        allowCreate: false,
    });

    bindChangeResetSelect({
        sourceSelector: `${ modalSelector } ${ departmentSelector }`,
        targetSelector: `${ modalSelector } ${ requesterSelector }`,
        reset: () => {
            toggleProfileOption({
                selector: `${ modalSelector } ${ requesterSelector }`,
                profileId: null,
                profileName: null
            });
        }
    });

    bindChangeResetSelect({
        sourceSelector: `${ modalSelector } ${ advisorSelector }`,
        targetSelector: `${ modalSelector } ${ clientSelector }`,
        reset: () => {
            toggleClientOption({
                selector: `${ modalSelector } ${ clientSelector }`,
                id: null,
                name: null
            });
        }
    });

    setupProductSelect({
        modalSelector,
        productSelector,
        allowCreate: false
    });
};

export const setGoodsIssueFormSelectOptions = (data = null) => {

    toggleDepartmentOption({
        selector: `${ modalSelector } ${ departmentSelector }`,
        id: data?.department?.id,
        name: data?.department?.name
    });

    toggleClientOption({
        selector: `${ modalSelector } ${ clientSelector }`,
        id: data?.client?.id,
        name: data?.client?.name
    });

    toggleProfileOption({
        selector: `${ modalSelector } ${ advisorSelector }`,
        profileId: data?.advisor?.id,
        profileName: data?.advisor?.fullName
    });

    toggleProfileOption({
        selector: `${ modalSelector } ${ requesterSelector }`,
        profileId: data?.requester?.id,
        profileName: data?.requester?.fullName, 
    });

    toggleProductOption({
        selector: `${ modalSelector } ${ productSelector }`,
        data: {
            id: null,
            text: null,
        }
    });
}
