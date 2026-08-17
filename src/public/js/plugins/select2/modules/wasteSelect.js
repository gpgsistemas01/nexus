import { mapSupplierMaterialToSelectData } from "../../../utils/materialSelectUtils.js";
import { initReasonSelect, toggleReasonOption } from "../domains/reason.js";
import { initSupplierMaterialSelect, toggleSupplierMaterialOption } from "../domains/supplierMaterial.js";
import { FORM_SELECTORS } from "../../../constants/selectors.js";
import { setFormSectionVisibility } from "../../../ui/formUI.js";

const getInputMaterialSelector = (modalSelector) => `${ modalSelector } ${ FORM_SELECTORS.MATERIAL }`;
const getInputReasonSelector = (modalSelector) => `${ modalSelector } ${ FORM_SELECTORS.REASON }`;
const getFormWasteSelector = (modalSelector) => `${ modalSelector } ${ FORM_SELECTORS.WASTE_FORM }`;

export const initWasteSelect2 = ({ modalSelector }) => {

    [
        [initSupplierMaterialSelect, { modalSelector, baseSelector: getInputMaterialSelector(modalSelector) }],
        [initReasonSelect, {
            modalSelector,
            baseSelector: getInputReasonSelector(modalSelector),
            allowCreate: false
        }]
    ].forEach(([initialize, options]) => initialize(options));

    $(getInputMaterialSelector(modalSelector))
        .off('.materialInput')
        .on('select2:select.materialInput', ({ params }) => {
            
            setFormSectionVisibility({
                form: document.querySelector(getFormWasteSelector(modalSelector)),
                isVisible: params?.data?.presentationName === 'ROLLO',
                fieldNames: ['weight']
            });
        })
        .on('select2:clear.materialInput change.materialInput', () => {

            const selectedValue = $(getInputMaterialSelector(modalSelector)).val();

            if (selectedValue) return;

            setFormSectionVisibility({
                form: document.querySelector(getFormWasteSelector(modalSelector)),
                isVisible: false,
                fieldNames: ['weight']
            });
        });
};

export const setWasteSelectOptions = ({ modalSelector, data = null }) => {

    toggleSupplierMaterialOption({
        selector: getInputMaterialSelector(modalSelector),
        data: data ? mapSupplierMaterialToSelectData(data) : null,
        modalSelector
    });

    toggleReasonOption({
        selector: getInputReasonSelector(modalSelector),
        id: data?.reason?.id,
        name: data?.reason?.name
    });
};
