import { openMaterialModal } from "../../../pages/warehouse/materials/materialModal.js";
import { getAllMaterials } from "../../../application/warehouse/materials.js";
import { buildPaginatedSelectParams, buildPaginatedSelectResults, initDomainSelect2, initFilterSelect2, runAfterSelect2Close, SELECT_RESULTS_LIMIT, setMdbWrapperInputValue, toggleSelectOption } from "../baseSelect.js";
import { mapSelectMaterialData } from "../../../utils/materialSelectUtils.js";
import { FORM_SELECTORS, FILTER_SELECTORS } from "../../../constants/selectors.js";

const wrapperSelector = FORM_SELECTORS.PRESENTATION_DISPLAY;
const materialSelector = FILTER_SELECTORS.MATERIAL;

export const initMaterialFilterSelect = ({
    selectedId = null,
    supplierFilterSelector = null
}) => {

    const baseSelector = 'body';

    initFilterSelect2({
        selector: materialSelector,
        getOptions: getAllMaterials,
        placeholder: 'Filtrar por material',
        selectedId,
        paginated: true,
        mapOption: mapSelectMaterialData,
        data: (params) => buildPaginatedSelectParams(params, {
            additionalParams: {
                supplierId: supplierFilterSelector
                    ? $(`${ baseSelector } ${ supplierFilterSelector }`).val()
                    : ''
            }
        })
    });
};

const initMaterialSelect = ({
    modalSelector,
    supplierSelector,
    baseSelector,
    allowCreate = true
}) => initDomainSelect2({
    selector: baseSelector,
    containerSelector: modalSelector,
    get: getAllMaterials,
    placeholder: 'Buscar material...',
    mapOption: mapSelectMaterialData,
    data: (params) => buildPaginatedSelectParams(params, {
        additionalParams: {
            supplierId: supplierSelector
                ? $(`${ modalSelector } ${ supplierSelector }`).val()
                : ''
        }
    }),
    allowCreate,
    newTagLabel: 'Nuevo material'
});

const attachMaterialHandler = ({
    modalSelector,
    baseSelector,
    supplierSelector,
    creationContext
}) => {

    $(baseSelector).off('select2:select').on('select2:select', (e) => {

        const { data } = e.params;

        if (data.newTag) {

            const name = data.id.replace('new:', '');
            const id = $(`${ modalSelector } ${ supplierSelector }`).val();
            const tradeName = $(`${ modalSelector } ${ supplierSelector } option:selected`).text();

            runAfterSelect2Close({
                selector: baseSelector,
                action: () => openMaterialModal({
                    creationContext,
                    data: {
                        name,
                        supplier: {
                            id,
                            tradeName,
                        }
                    },           
                    onSave: (createdMaterial) => {

                        toggleMaterialOption({
                            selector: baseSelector,
                            data: mapSelectMaterialData(createdMaterial)
                        });

                        setMdbWrapperInputValue({
                            selector: `${ modalSelector } ${ wrapperSelector }`,
                            value: createdMaterial.presentation.name
                        });
                    }
                })
            });

            return;
        }

        const option = e.target.querySelector('option:checked');

        if (!option) return;

        Object.entries(data).forEach(([key, value]) => {
            option.dataset[key] = value;
        });

        const value = data.presentationName || '';

        setMdbWrapperInputValue({
            selector: `${ modalSelector } ${ wrapperSelector }`,
            value
        });
    });
};

export const toggleMaterialOption = ({
    selector,
    data
}) => toggleSelectOption({
    selector,
    data
});

export const setupMaterialSelect = ({
    modalSelector,
    supplierSelector = null,
    materialSelector,
    allowCreate = true,
    creationContext = null
}) => {

    const baseSelector = `${ modalSelector } ${ materialSelector }`;

    initMaterialSelect({
        modalSelector,
        supplierSelector,
        baseSelector,
        allowCreate
    });

    attachMaterialHandler({
        modalSelector,
        baseSelector,
        supplierSelector,
        creationContext
    });
};
