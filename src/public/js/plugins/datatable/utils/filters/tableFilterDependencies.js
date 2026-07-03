import { toggleProductOption } from "../../../select2/domains/product.js";
import { FILTER_SELECTORS } from "../../../../constants/selectors.js";
import { toggleDisabledElement } from "../../../../utils/formUtils.js";

const dependencyEvent = 'change.tableFilterDependency';

const clearSelectFilter = (selector) => {

    $(selector).val(null).trigger('change');
};

const bindDisabledFilterDependency = ({
    sourceSelector,
    targetSelector,
    clearTarget = () => {},
    isDisabled = (value) => !value
}) => {

    const $source = $(sourceSelector);
    const targetElement = document.querySelector(targetSelector);

    if (!$source.length || !targetElement) return;

    const getDisabledState = (value) => isDisabled(value);

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
        }
    });
};

const bindDepartmentProfileFilterDependency = () => {

    bindDisabledFilterDependency({
        sourceSelector: FILTER_SELECTORS.DEPARTMENT,
        targetSelector: FILTER_SELECTORS.PROFILE,
        clearTarget: () => clearSelectFilter(FILTER_SELECTORS.PROFILE)
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
