import { getPresentation, mapSelectMaterialData } from "../../../utils/warehouseInventoryUtils.js";
import { initReasonSelect, toggleReasonOption } from "../domains/reason.js";
import { initSupplierMaterialSelect, toggleSupplierMaterialOption } from "../domains/supplierMaterial.js";
import { FORM_SELECTORS } from "../../../constants/selectors.js";
import { setFormSectionVisibility } from "../../../ui/forms/formStateUI.js";

let scoped = null;
const selectors = {
    material: FORM_SELECTORS.MATERIAL,
    reason: FORM_SELECTORS.REASON,
    wasteForm: FORM_SELECTORS.WASTE_FORM
};

export const initWasteSelect2 = ({ modalSelector }) => {

    scoped = Object.fromEntries(Object.entries(selectors).map(
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

            const material = JSON.parse(params?.data?.material || '{}');

            setFormSectionVisibility({
                form: document.querySelector(scoped.wasteForm),
                isVisible: getPresentation(material) === 'ROLLO',
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
            selector: scoped.material,
            data: data?.supplierMaterial ? mapSelectMaterialData(data.supplierMaterial) : null,
            modalSelector
        }],
        [toggleReasonOption, {
            selector: scoped.reason,
            id: data?.reason?.id,
            name: data?.reason?.name
        }]
    ].forEach(([toggleOption, options]) => toggleOption({
        ...options,
    }));
};
