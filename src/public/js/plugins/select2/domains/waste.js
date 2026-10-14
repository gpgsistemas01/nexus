import { getAllWastes } from "../../../application/warehouse/wastes/wastes.js";
import { SELECT2_EVENT_NAMES } from '../../../constants/events.js';
import { updatePresentationDisplay } from '../../../ui/inventory/inventorySelectUI.js';
import { mapSelectWasteData, normalizeInventorySelectRelations } from "../../../utils/warehouseInventoryUtils.js";
import { buildPaginatedSelectParams, initDomainSelect2, toggleSelectOption } from "../baseSelect.js";

const initWasteSelect = ({
    modalSelector,
    supplierSelector,
    baseSelector
}) => initDomainSelect2({
    selector: baseSelector,
    containerSelector: modalSelector,
    get: getAllWastes,
    placeholder: 'Buscar merma...',
    mapOption: mapSelectWasteData,
    data: (params) => buildPaginatedSelectParams(params, {
        additionalParams: {
            supplierId: supplierSelector
                ? $(`${ modalSelector } ${ supplierSelector }`).val()
                : ''
        }
    }),
    allowCreate: false,
    newTagLabel: 'Nueva merma'
});

const attachWasteHandler = ({ modalSelector, baseSelector }) => {
    $(baseSelector).off(SELECT2_EVENT_NAMES.SELECT).on(SELECT2_EVENT_NAMES.SELECT, (event) => {
        const { data } = event.params;
        const { presentation } = normalizeInventorySelectRelations(data);

        updatePresentationDisplay({
            modalSelector,
            data,
            presentation,
            option: event.target.querySelector('option:checked')
        });
    });
};

export const toggleWasteOption = ({
    selector,
    data
}) => toggleSelectOption({
    selector,
    data
});

export const setupWasteSelect = ({
    modalSelector,
    supplierSelector = null,
    wasteSelector
}) => {

    const baseSelector = `${ modalSelector } ${ wasteSelector }`;

    initWasteSelect({
        modalSelector,
        supplierSelector,
        baseSelector
    });

    attachWasteHandler({
        modalSelector,
        baseSelector
    });

};
