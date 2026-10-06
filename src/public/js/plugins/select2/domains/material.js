import { SELECT2_EVENT_NAMES } from '../../../constants/events.js';
import { openMaterialModal } from "../../../pages/warehouse/materials/materialModal.js";
import { getAllMaterials } from '../../../application/warehouse/materials/materials.js';
import { getAllConsumables } from '../../../application/warehouse/consumables/consumables.js';
import { buildPaginatedSelectParams, initDomainSelect2, initFilterSelect2, runAfterSelect2Close, toggleSelectOption } from "../baseSelect.js";
import { setMdbWrapperInputValue } from '../../mdb/baseInstance.js';
import { mapSelectMaterialData, parseInventorySelectJson } from "../../../utils/warehouseInventoryUtils.js";
import { FILTER_SELECTORS, INPUT_SELECTORS } from "../../../constants/selectors.js";
import { updatePresentationDisplay } from '../../../ui/inventory/inventorySelectUI.js';
import { INVENTORY_RESOURCES } from '../../../constants/inventory.js';

const wrapperSelector = INPUT_SELECTORS.PRESENTATION_DISPLAY;
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
    allowCreate = true,
    resource = INVENTORY_RESOURCES.MATERIAL
}) => initDomainSelect2({
    selector: baseSelector,
    containerSelector: modalSelector,
    get: resource === INVENTORY_RESOURCES.CONSUMABLE ? getAllConsumables : getAllMaterials,
    placeholder: resource === INVENTORY_RESOURCES.CONSUMABLE ? 'Buscar consumible...' : 'Buscar material...',
    mapOption: mapSelectMaterialData,
    data: (params) => buildPaginatedSelectParams(params, {
        additionalParams: {
            supplierId: supplierSelector
                ? $(`${ modalSelector } ${ supplierSelector }`).val()
                : ''
        }
    }),
    allowCreate,
    newTagLabel: resource === INVENTORY_RESOURCES.CONSUMABLE ? 'Nuevo consumible' : 'Nuevo material'
});

const attachMaterialHandler = ({
    modalSelector,
    baseSelector,
    supplierSelector,
    creationContext,
    resource
}) => {

    $(baseSelector).off(SELECT2_EVENT_NAMES.SELECT).on(SELECT2_EVENT_NAMES.SELECT, (e) => {

        const { data } = e.params;

        if (data.newTag) {

            const name = data.id.replace('new:', '');
            const id = $(`${ modalSelector } ${ supplierSelector }`).val();
            const tradeName = $(`${ modalSelector } ${ supplierSelector } option:selected`).text();

            runAfterSelect2Close({
                selector: baseSelector,
                action: () => openMaterialModal({
                    creationContext,
                    resource,
                    data: {
                        name,
                        supplier: {
                            id,
                            tradeName,
                        }
                    },           
                    onSave: (createdSupplierMaterial) => {

                        const material = createdSupplierMaterial.material;
                        const materialOption = mapSelectMaterialData(createdSupplierMaterial);

                        toggleMaterialOption({
                            selector: baseSelector,
                            data: materialOption
                        });

                        setMdbWrapperInputValue({
                            selector: `${ modalSelector } ${ wrapperSelector }`,
                            value: material.presentation.name
                        });
                    }
                })
            });

            return;
        }

        const material = parseInventorySelectJson(data.material);

        updatePresentationDisplay({
            modalSelector,
            data,
            presentation: material.presentation,
            option: e.target.querySelector('option:checked')
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
    creationContext = null,
    resource = INVENTORY_RESOURCES.MATERIAL
}) => {

    const baseSelector = `${ modalSelector } ${ materialSelector }`;

    initMaterialSelect({
        modalSelector,
        supplierSelector,
        baseSelector,
        allowCreate,
        resource
    });

    attachMaterialHandler({
        modalSelector,
        baseSelector,
        supplierSelector,
        creationContext,
        resource
    });
};
