import { toggleProductOption } from "../../../select2/domains/product.js";
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
    productRequiresSupplier: 'Seleccione un proveedor antes de filtrar por producto.',
    profileRequiresDepartment: 'Seleccione un área antes de filtrar por perfil.'
};

const clearSelectFilter = (selector) => {

    $(selector).val(null).trigger('change');
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

const bindSupplierProductFilterDependency = () => {

    bindDisabledFilterDependency({
        sourceSelector: FILTER_SELECTORS.SUPPLIER,
        targetSelector: FILTER_SELECTORS.PRODUCT,
        clearTarget: () => {
            toggleProductOption({
                selector: FILTER_SELECTORS.PRODUCT,
                data: {
                    id: null,
                    text: null
                }
            });

            clearSelectFilter(FILTER_SELECTORS.PRODUCT);
        },
        disabledMessage: DEPENDENT_FILTER_MESSAGES.productRequiresSupplier
    });
};

const bindDepartmentProfileFilterDependency = () => {

    bindDisabledFilterDependency({
        sourceSelector: FILTER_SELECTORS.DEPARTMENT,
        targetSelector: FILTER_SELECTORS.PROFILE,
        clearTarget: () => clearSelectFilter(FILTER_SELECTORS.PROFILE),
        disabledMessage: DEPENDENT_FILTER_MESSAGES.profileRequiresDepartment
    });
};

export const bindTableFilterDependencies = (fields = []) => {

    if (fields.includes('supplier') && fields.includes('product')) {
        bindSupplierProductFilterDependency();
    }

    if (fields.includes('department') && fields.includes('profile')) {
        bindDepartmentProfileFilterDependency();
    }
};
