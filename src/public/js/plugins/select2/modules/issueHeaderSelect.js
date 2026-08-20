import { DOM_EVENT_NAMES } from '../../../constants/events.js';
import { getSelectedOptionText } from '../../../utils/domUtils.js';
import { isInternalClientName, resolveAdvisorDepartmentByClientName, resolveProjectNumberByClientAndDepartment } from '../../../application/warehouse/issues/issueHeaderRules.js';
import { bindDisabledSelectDependency } from '../baseSelect.js';
import { setupClientSelect, toggleClientOption } from '../domains/client.js';
import { initDepartmentSelect, toggleDepartmentOption } from '../domains/department.js';
import { initPersonSelect, togglePersonOption } from '../domains/person.js';
import { initMdbWrapperInput, updateMdbWrapperInput } from '../../mdb/baseInstance.js';
import { toggleDisabledElement } from '../../../utils/formUtils.js';
import { FORM_MODES } from '../../../constants/formModes.js';

const EDITABLE_MODES = [FORM_MODES.CREATE, FORM_MODES.EDIT, FORM_MODES.EDIT_HEADER];

export const createIssueHeaderSelects = ({ modalSelector, formSelector, selectors }) => {

    const scoped = Object.fromEntries(Object.entries(selectors).map(
        ([name, selector]) => [name, `${ modalSelector } ${ selector }`]
    ));
    const canEdit = () => EDITABLE_MODES.includes(document.querySelector(formSelector)?.dataset.mode);

    const syncState = () => {

        [
            [scoped.department, scoped.requester],
            [scoped.client, scoped.advisor]
        ].forEach(([sourceSelector, targetSelector]) => toggleDisabledElement({
            element: document.querySelector(targetSelector),
            isDisabled: !canEdit() || !$(sourceSelector).val()
        }));
    };

    const init = () => {

        [
            [initDepartmentSelect, { 
                modalSelector, 
                baseSelector: scoped.department, 
                allowCreate: false 
            }],
            [setupClientSelect, { 
                modalSelector, 
                clientSelector: selectors.client 
            }],
            [initPersonSelect, { 
                modalSelector, 
                baseSelector: scoped.advisor, 
                placeholder: 'Buscar asesor...', 
                data: params => {

                    const clientName = getSelectedOptionText(scoped.client);

                    return {
                        search: params.term,
                        ...(isInternalClientName(clientName)
                            ? { role: 'Coordinador' }
                            : { department: resolveAdvisorDepartmentByClientName({ clientName }), strictDepartmentFilter: true })
                    };
                }
            }],
            [initPersonSelect, {
                modalSelector,
                baseSelector: scoped.requester,
                placeholder: 'Buscar solicitante...',
                data: params => ({
                    search: params.term,
                    department: getSelectedOptionText(scoped.department),
                    strictDepartmentFilter: true
                }),
                allowCreate: false
            }]
        ].forEach(([initialize, options]) => initialize(options));

        [
            { source: scoped.department, target: scoped.requester },
            { source: scoped.client, target: scoped.advisor }
        ].forEach(({ source, target }) => bindDisabledSelectDependency({
            sourceSelector: source,
            targetSelector: target,
            clearTarget: () => $(target).val(null).trigger(DOM_EVENT_NAMES.CHANGE),
            isDisabled: value => !canEdit() || !value,
            disabledMessage: source === scoped.department
                ? 'Seleccione un área antes de buscar solicitante.'
                : 'Seleccione un cliente antes de buscar asesor.',
            onChange: () => {

                const projectNumber = resolveProjectNumberByClientAndDepartment({
                    clientName: getSelectedOptionText(scoped.client),
                    departmentName: getSelectedOptionText(scoped.department)
                });
                const input = document.querySelector(scoped.projectNumber);

                if (!input) return;

                input.value = projectNumber || '';
                updateMdbWrapperInput(initMdbWrapperInput({ selector: scoped.projectNumber, value: input.value }));
            }
        }));
    };

    const setOptions = (data = null) => {

        [
            [toggleDepartmentOption, scoped.department, data?.departmentId, data?.departmentName],
            [toggleClientOption, scoped.client, data?.clientId, data?.clientName],
            [togglePersonOption, scoped.advisor, data?.advisorId, data?.advisorName],
            [togglePersonOption, scoped.requester, data?.requesterId, data?.requesterName]
        ].forEach(([toggleOption, selector, id, name]) => {
            toggleOption({ selector, id, name });
        });
    };

    return { init, setOptions, syncState };
};
