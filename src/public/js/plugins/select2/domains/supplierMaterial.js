import { getAllMaterials } from "../../../application/warehouse/materials.js";
import { mapSupplierMaterialToSelectData } from "../../../utils/materialSelectUtils.js";
import { initDomainSelect2, toggleSelectOption } from "../baseSelect.js";
import { setSupplierMaterialSummaryValues } from "../../../pages/warehouse/materials/supplierMaterialSummary.js";

const attachSupplierMaterialDisplayHandler = ({
    modalSelector,
    baseSelector
}) => {

    $(baseSelector)
        .off('.supplierMaterialDisplay')
        .on('select2:select.supplierMaterialDisplay', ({ params }) => {

            setSupplierMaterialSummaryValues({
                modalSelector,
                data: params?.data
            });
        })
        .on('select2:clear.supplierMaterialDisplay change.supplierMaterialDisplay', () => {

            const selectedValue = $(baseSelector).val();

            if (selectedValue) return;

            setSupplierMaterialSummaryValues({
                modalSelector,
                data: null
            });
        });
};

const initSupplierMaterialSelect = ({
    modalSelector,
    baseSelector,
    placeholder = 'Buscar material...'
}) => {

    initDomainSelect2({
        selector: baseSelector,
        containerSelector: modalSelector,
        get: getAllMaterials,
        placeholder,
        mapOption: mapSupplierMaterialToSelectData,
        allowCreate: false
    });
};

export const toggleSupplierMaterialOption = ({
    selector,
    data,
    modalSelector = null
}) => {

    toggleSelectOption({
        selector,
        data
    });

    if (!modalSelector) return;

    setSupplierMaterialSummaryValues({
        modalSelector,
        data
    });
};


export const setupSupplierMaterialSelect = ({
    modalSelector,
    materialSelector
}) => {

    const baseSelector = `${ modalSelector } ${ materialSelector }`;

    initSupplierMaterialSelect({
        modalSelector,
        baseSelector
    });

    attachSupplierMaterialDisplayHandler({
        modalSelector,
        baseSelector
    });
};
