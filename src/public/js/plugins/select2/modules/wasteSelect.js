import { mapSupplierMaterialToSelectData } from "../../../utils/materialSelectUtils.js";
import { initReasonSelect, toggleReasonOption } from "../domains/reason.js";
import { setupSupplierMaterialSelect, toggleSupplierMaterialOption } from "../domains/supplierMaterial.js";
import { FORM_SELECTORS } from "../../../constants/selectors.js";

const materialSelector = FORM_SELECTORS.MATERIAL;
const reasonSelector = FORM_SELECTORS.REASON;

export const initWasteSelect2 = ({ modalSelector }) => {
    [
        [setupSupplierMaterialSelect, { modalSelector, materialSelector }],
        [initReasonSelect, {
            modalSelector,
            baseSelector: `${ modalSelector } ${ reasonSelector }`,
            allowCreate: false
        }]
    ].forEach(([initialize, options]) => initialize(options));
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
