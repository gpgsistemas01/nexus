import { getWasteMaterialTemplates } from '../../../application/warehouse/wastes/wastes.js';
import { initDomainSelect2, toggleSelectOption } from '../baseSelect.js';
import { mapSelectWasteMaterialTemplateData, normalizeWasteMaterialTemplateOption } from '../../../utils/warehouseInventoryUtils.js';
import { SELECT2_EVENT_NAMES } from '../../../constants/events.js';

const attachWasteMaterialTemplateHandler = ({ baseSelector, onSelect }) => {
    $(baseSelector).off(SELECT2_EVENT_NAMES.SELECT).on(SELECT2_EVENT_NAMES.SELECT, ({ params }) => {
        onSelect?.(normalizeWasteMaterialTemplateOption(params.data));
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

    attachWasteMaterialTemplateHandler({ baseSelector, onSelect });
};

export const toggleWasteMaterialTemplateOption = ({ selector, data }) => {
    toggleSelectOption({ selector, data });
};
