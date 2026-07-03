import { getSelectedOptionText } from "../../../utils/domUtils.js";
import { resolveAdvisorDepartmentByClientName, resolveProjectNumberByClientAndDepartment } from "../../../application/warehouse/goodsIssues/goodsIssueRules.js";
import { bindDependency, bindDisabledSelectDependency } from "../baseSelect.js";
import { setupClientSelect, toggleClientOption } from "../domains/client.js";
import { initDepartmentSelect, toggleDepartmentOption } from "../domains/department.js";
import { setupProductSelect, toggleProductOption } from "../domains/product.js";
import { initProfileSelect, toggleProfileOption } from "../domains/profile.js";
import { initMdbWrapperInput, updateMdbWrapperInput } from "../../mdb/baseInstance.js";
import { FORM_SELECTORS, MODAL_SELECTORS } from "../../../constants/selectors.js";

const modalSelector = MODAL_SELECTORS.GOODS_ISSUE;
const requesterSelector = FORM_SELECTORS.REQUESTER;
const clientSelector = FORM_SELECTORS.CLIENT;
const departmentSelector = FORM_SELECTORS.DEPARTMENT;
const advisorSelector = FORM_SELECTORS.ADVISOR;
const productSelector = FORM_SELECTORS.PRODUCT;
const projectNumberSelector = FORM_SELECTORS.PROJECT_NUMBER;
const requesterScopedSelector = `${ modalSelector } ${ requesterSelector }`;
const clientScopedSelector = `${ modalSelector } ${ clientSelector }`;
const departmentScopedSelector = `${ modalSelector } ${ departmentSelector }`;
const advisorScopedSelector = `${ modalSelector } ${ advisorSelector }`;
const productScopedSelector = `${ modalSelector } ${ productSelector }`;

export const initGoodsIssueFormSelect2 = () => {

    const modal = document.querySelector(modalSelector);
    const syncInternalClientProjectNumber = () => {
        const projectNumberInput = modal?.querySelector(projectNumberSelector);
        if (!projectNumberInput) return;

        const projectNumber = resolveProjectNumberByClientAndDepartment({
            clientName: getSelectedOptionText(clientScopedSelector),
            departmentName: getSelectedOptionText(departmentScopedSelector)
        });

        projectNumberInput.value = projectNumber || '';

        const projectNumberInputInstance = initMdbWrapperInput({
            selector: `${ modalSelector } ${ projectNumberSelector }`,
            value: projectNumber || ''
        });
        updateMdbWrapperInput(projectNumberInputInstance);
    };

    initDepartmentSelect({
        modalSelector,
        baseSelector: departmentScopedSelector,
        allowCreate: false
    });

    setupClientSelect({
        modalSelector,
        clientSelector,
    });

    initProfileSelect({
        modalSelector,
        baseSelector: advisorScopedSelector,
        placeholder: 'Buscar asesor...',
        data: (params) => {

            return {
                search: params.term,
                department: resolveAdvisorDepartmentByClientName({
                    clientName: getSelectedOptionText(clientScopedSelector)
                }),
                strictDepartmentFilter: true
            };
        },
        allowCreate: false,
    });

    initProfileSelect({
        modalSelector,
        baseSelector: requesterScopedSelector,
        placeholder: 'Buscar solicitante...',
        data: (params) => {

            const department = getSelectedOptionText(departmentScopedSelector);

            return {
                search: params.term,
                department,
                strictDepartmentFilter: true
            };
        },
        allowCreate: false,
    });

    bindDisabledSelectDependency({
        sourceSelector: departmentScopedSelector,
        targetSelector: requesterScopedSelector,
        clearTarget: () => {
            toggleProfileOption({
                selector: requesterScopedSelector,
                id: null,
                name: null
            });

            $(requesterScopedSelector).val(null).trigger('change');
        },
        onChange: () => syncInternalClientProjectNumber()
    });

    bindDependency({
        sourceSelector: clientScopedSelector,
        onChange: () => {
            syncInternalClientProjectNumber();

            toggleProfileOption({
                selector: advisorScopedSelector,
                id: null,
                name: null
            });

            $(advisorScopedSelector).val(null).trigger('change');
        }
    });

    // bindChangeResetSelect({
    //     sourceSelector: `${ modalSelector } ${ advisorSelector }`,
    //     targetSelector: `${ modalSelector } ${ clientSelector }`,
    //     reset: () => {
    //         toggleClientOption({
    //             selector: clientScopedSelector,
    //             id: null,
    //             name: null
    //         });
    //     }
    // });

    setupProductSelect({
        modalSelector,
        productSelector,
        allowCreate: false
    });
};

export const setGoodsIssueFormSelectOptions = (data = null) => {

    toggleDepartmentOption({
        selector: departmentScopedSelector,
        id: data?.departmentId,
        name: data?.departmentName
    });

    toggleClientOption({
        selector: clientScopedSelector,
        id: data?.clientId,
        name: data?.clientName
    });

    toggleProfileOption({
        selector: advisorScopedSelector,
        id: data?.advisorId,
        name: data?.advisorName
    });

    toggleProfileOption({
        selector: requesterScopedSelector,
        id: data?.requesterId,
        name: data?.requesterName
    });

    toggleProductOption({
        selector: productScopedSelector,
        data: {
            id: null,
            text: null,
        }
    });
}
