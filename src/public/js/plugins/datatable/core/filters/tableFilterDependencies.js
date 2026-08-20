import { DOM_EVENT_NAMES } from '../../../../constants/events.js';
import { toggleMaterialOption } from "../../../select2/domains/material.js";
import { FILTER_SELECTORS } from "../../../../constants/selectors.js";
import { toggleDisabledElement } from "../../../../utils/formUtils.js";
import { bindDisabledControlWarning, setDisabledControlWarning } from "../../../../ui/disabledControlWarning.js";

const dependencyEvent = 'change.tableFilterDependency';
const select2DisabledWarningConfig = {
    eventTargetSelector: '.select2-container',
    eventNamespace: 'select2DisabledWarning',
    resolveControl: (container) => {
        const select = container?.previousElementSibling;

        return select?.tagName === 'SELECT' ? select : null;
    }
};

bindDisabledControlWarning(select2DisabledWarningConfig);


const DEPENDENT_FILTER_MESSAGES = {
    materialRequiresSupplier: 'Seleccione un proveedor antes de filtrar por material.',
    personRequiresDepartment: 'Seleccione un área antes de filtrar por persona.'
};

const clearSelectFilter = (selector) => {

    $(selector).val(null).trigger(DOM_EVENT_NAMES.CHANGE);
};


const bindDisabledFilterDependency = ({
    sourceSelector,
    targetSelector,
    clearTarget = () => {},
    isDisabled = (value) => !value,
    disabledMessage = null
}) => {

    const $source = $(sourceSelector);
    const targetElement = document.querySelector(targetSelector);

    if (!$source.length || !targetElement) return;

    const getDisabledState = (value) => isDisabled(value);

    setDisabledControlWarning({
        element: targetElement,
        message: disabledMessage
    });

    toggleDisabledElement({
        element: targetElement,
        isDisabled: getDisabledState($source.val())
    });

    $source
        .off(dependencyEvent)
        .on(dependencyEvent, () => {

            const value = $source.val();
            const disabled = getDisabledState(value);

            clearTarget({
                value,
                source: $source,
                targetElement,
                isDisabled: disabled
            });

            toggleDisabledElement({
                element: targetElement,
                isDisabled: disabled
            });
        });
};

const bindSupplierMaterialFilterDependency = () => {

    bindDisabledFilterDependency({
        sourceSelector: FILTER_SELECTORS.SUPPLIER,
        targetSelector: FILTER_SELECTORS.MATERIAL,
        clearTarget: () => {
            toggleMaterialOption({
                selector: FILTER_SELECTORS.MATERIAL,
                data: {
                    id: null,
                    text: null
                }
            });

            clearSelectFilter(FILTER_SELECTORS.MATERIAL);
        },
        disabledMessage: DEPENDENT_FILTER_MESSAGES.materialRequiresSupplier
    });
};

const bindDepartmentPersonFilterDependency = () => {

    bindDisabledFilterDependency({
        sourceSelector: FILTER_SELECTORS.DEPARTMENT,
        targetSelector: FILTER_SELECTORS.PERSON,
        clearTarget: () => clearSelectFilter(FILTER_SELECTORS.PERSON),
        disabledMessage: DEPENDENT_FILTER_MESSAGES.personRequiresDepartment
    });
};

export const bindTableFilterDependencies = (fields = []) => {

    if (fields.includes('supplier') && fields.includes('material')) {
        bindSupplierMaterialFilterDependency();
    }

    if (fields.includes('department') && fields.includes('person')) {
        bindDepartmentPersonFilterDependency();
    }
};
