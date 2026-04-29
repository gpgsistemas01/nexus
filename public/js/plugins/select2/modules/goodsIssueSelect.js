import { initAdvisorSelect, toggleAdvisorOption } from "../domains/advisor.js";
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

const bindChangeResetSelect = ({ sourceSelector, targetSelector, reset }) => {
    const source = document.querySelector(sourceSelector);

    if (!source) return;
    if (source.dataset.resetBound === 'true') return;
    source.dataset.resetBound = 'true';

    source.addEventListener('change', () => {
        if (typeof reset === 'function') reset();
        else {
            const target = document.querySelector(targetSelector);
            if (!target) return;
            target.value = '';
            target.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
};

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

    initAdvisorSelect({
        modalSelector,
        baseSelector: `${ modalSelector } ${ advisorSelector }`,
        allowCreate: false
    });

    initProfileSelect({
        modalSelector, 
        baseSelector: `${ modalSelector } ${ requesterSelector }`,
        placeholder: 'Buscar solicitante...',
        data: (params) => {
            const departmentName = $(`${ modalSelector } ${ departmentSelector }`).find(':selected').text()?.trim();

            return {
                search: params.term,
                department: departmentName || '',
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

    toggleAdvisorOption({
        selector: `${ modalSelector } ${ advisorSelector }`,
        id: data?.advisor?.id,
        name: data?.advisor?.name
    });

    toggleProfileOption({
        selector: `${ modalSelector } ${ requesterSelector }`,
        profileId: data?.project?.id,
        profileName: `${ data?.requester?.name } ${ data?.requester?.lastName }`, 
    });

    toggleProductOption({
        selector: `${ modalSelector } ${ productSelector }`,
        data: {
            id: null,
            text: null,
        }
    });
}
