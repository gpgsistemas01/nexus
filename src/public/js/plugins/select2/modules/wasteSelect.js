import { mapSupplierMaterialToSelectData } from "../../../utils/materialSelectUtils.js";
import { initReasonSelect, toggleReasonOption } from "../domains/reason.js";
import { setupSupplierMaterialSelect, toggleSupplierMaterialOption } from "../domains/supplierMaterial.js";
import { FORM_SELECTORS } from "../../../constants/selectors.js";
import { toggleDisabledElement } from "../../../utils/formUtils.js";

const materialSelector = FORM_SELECTORS.MATERIAL;
const reasonSelector = FORM_SELECTORS.REASON;

export const initWasteSelect2 = ({ modalSelector }) => {

    setupSupplierMaterialSelect({
        modalSelector,
        materialSelector
    });

    initReasonSelect({
        modalSelector,
        baseSelector: `${ modalSelector } ${ reasonSelector }`,
        allowCreate: false
    });
};

export const setWasteSelectOptions = ({ modalSelector, data = null }) => {

    toggleSupplierMaterialOption({
        selector: `${ modalSelector } ${ materialSelector }`,
        data: data ? mapSupplierMaterialToSelectData(data) : null,
        modalSelector
    });

    toggleReasonOption({
        selector: `${ modalSelector } ${ reasonSelector }`,
        id: data?.reason?.id,
        name: data?.reason?.name
    });
};


export const setWasteReasonVisualOption = ({
    modalSelector,
    name,
    isDisabled = false
}) => {

    const reasonScopedSelector = `${ modalSelector } ${ reasonSelector }`;
    const reasonSelect = document.querySelector(reasonScopedSelector);

    if (name) {
        toggleReasonOption({
            selector: reasonScopedSelector,
            id: `visual:${ name }`,
            name
        });
    }

    toggleDisabledElement({
        element: reasonSelect,
        isDisabled
    });
};
