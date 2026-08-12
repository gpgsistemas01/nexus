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
    const scoped = Object.fromEntries(Object.entries(selectors).map(([name, selector]) => [name, `${ modalSelector } ${ selector }`]));
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

    const syncProjectNumber = () => {
        const projectNumber = resolveProjectNumberByClientAndDepartment({
            clientName: getSelectedOptionText(scoped.client),
            departmentName: getSelectedOptionText(scoped.department)
        });
        const input = document.querySelector(scoped.projectNumber);
        if (!input) return;
        input.value = projectNumber || '';
        updateMdbWrapperInput(initMdbWrapperInput({ selector: scoped.projectNumber, value: input.value }));
    };

    const init = () => {
        initDepartmentSelect({ modalSelector, baseSelector: scoped.department, allowCreate: false });
        setupClientSelect({ modalSelector, clientSelector: selectors.client });
        initPersonSelect({
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
            },
            allowCreate: false
        });
        initPersonSelect({
            modalSelector,
            baseSelector: scoped.requester,
            placeholder: 'Buscar solicitante...',
            data: params => ({
                search: params.term,
                department: getSelectedOptionText(scoped.department),
                strictDepartmentFilter: true
            }),
            allowCreate: false
        });

        [
            { source: scoped.department, target: scoped.requester },
            { source: scoped.client, target: scoped.advisor }
        ].forEach(({ source, target }) => bindDisabledSelectDependency({
            sourceSelector: source,
            targetSelector: target,
            clearTarget: () => $(target).val(null).trigger('change'),
            isDisabled: value => !canEdit() || !value,
            disabledMessage: source === scoped.department
                ? 'Seleccione un área antes de buscar solicitante.'
                : 'Seleccione un cliente antes de buscar asesor.',
            onChange: syncProjectNumber
        }));
    };

    const setOptions = (data = null) => {
        toggleDepartmentOption({ selector: scoped.department, id: data?.departmentId, name: data?.departmentName });
        toggleClientOption({ selector: scoped.client, id: data?.clientId, name: data?.clientName });
        togglePersonOption({ selector: scoped.advisor, id: data?.advisorId, name: data?.advisorName });
        togglePersonOption({ selector: scoped.requester, id: data?.requesterId, name: data?.requesterName });
    };

    return { init, setOptions, syncState };
};
