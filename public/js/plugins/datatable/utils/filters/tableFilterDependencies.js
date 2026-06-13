import { bindDisabledSelectDependency } from "../../../select2/baseSelect.js";
import { toggleProductOption } from "../../../select2/domains/product.js";
import { FILTER_SELECTORS } from "../../../../constants/selectors.js";

const clearSelectFilter = (selector) => {

    $(selector).val(null).trigger('change');
};

const bindSupplierProductFilterDependency = () => {

    bindDisabledSelectDependency({
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

    bindDisabledSelectDependency({
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
