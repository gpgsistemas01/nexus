import { mapSupplierMaterialToSelectData } from "../../../utils/materialSelectUtils.js";
import { initReasonSelect, toggleReasonOption } from "../domains/reason.js";
import { initSupplierMaterialSelect, toggleSupplierMaterialOption } from "../domains/supplierMaterial.js";
import { FORM_SELECTORS } from "../../../constants/selectors.js";
import { setFormSectionVisibility } from "../../../ui/formUI.js";

let scoped = null;
const selectors = {
    material: FORM_SELECTORS.MATERIAL,
    reason: FORM_SELECTORS.REASON,
    wasteForm: FORM_SELECTORS.WASTE_FORM
};

export const initWasteSelect2 = ({ modalSelector }) => {

    if (!scoped) scoped = Object.fromEntries(Object.entries(selectors).map(
        ([name, selector]) => [name, `${ modalSelector } ${ selector }`]
    ));

    [
        [initSupplierMaterialSelect, { 
            modalSelector, 
            baseSelector: scoped.material, 
            allowCreate: false 
        }],
        [initReasonSelect, {
            modalSelector,
            baseSelector: scoped.reason,
            allowCreate: false
        }]
    ].forEach(([initialize, options]) => initialize(options));

    $(scoped.material)
        .off('.materialInput')
        .on('select2:select.materialInput', ({ params }) => {

            setFormSectionVisibility({
                form: document.querySelector(scoped.wasteForm),
                isVisible: params?.data?.presentationName === 'ROLLO',
                fieldNames: ['weight']
            });
        })
        .on('select2:clear.materialInput change.materialInput', () => {

            const selectedValue = $(scoped.material).val();

            if (selectedValue) return;

            setFormSectionVisibility({
                form: document.querySelector(scoped.wasteForm),
                isVisible: false,
                fieldNames: ['weight']
            });
        });
};

export const setWasteSelectOptions = ({ modalSelector, data = null }) => {

    [
        [toggleSupplierMaterialOption, {
            selector: getInputMaterialSelector(modalSelector),
            data: data ? mapSupplierMaterialToSelectData(data) : null,
            modalSelector
        }],
        [toggleReasonOption, {
            selector: getInputReasonSelector(modalSelector),
            id: data?.reason?.id,
            name: data?.reason?.name
        }]
    ].forEach(([toggleOption, options]) => toggleOption({
        ...options,
    }));
};