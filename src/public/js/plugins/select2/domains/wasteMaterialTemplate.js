import { getWasteMaterialTemplates } from '../../../application/warehouse/wastes/wastes.js';
import { initDomainSelect2, toggleSelectOption } from '../baseSelect.js';
import { mapSelectWasteMaterialTemplateData, normalizeInventorySelectRelations } from '../../../utils/warehouseInventoryUtils.js';
import { SELECT2_EVENT_NAMES } from '../../../constants/events.js';

const bindWasteMaterialTemplateSelection = ({ baseSelector, onSelect }) => {
    $(baseSelector).off(SELECT2_EVENT_NAMES.SELECT).on(SELECT2_EVENT_NAMES.SELECT, ({ params }) => {
        onSelect?.(normalizeInventorySelectRelations(params.data));
    });
};

export const initWasteMaterialTemplateSelect = ({ modalSelector, baseSelector, onSelect }) => {
    initDomainSelect2({
        selector: baseSelector,
        containerSelector: modalSelector,
        get: getWasteMaterialTemplates,
        placeholder: 'Buscar material de referencia...',
        mapOption: mapSelectWasteMaterialTemplateData,
        allowCreate: false
    });

    bindWasteMaterialTemplateSelection({ baseSelector, onSelect });
};

export const toggleWasteMaterialTemplateOption = ({ selector, data }) => {
    toggleSelectOption({ selector, data });
};
