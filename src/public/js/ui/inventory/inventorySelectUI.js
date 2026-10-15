import { setFormSectionVisibility, setFormDisabled } from '../forms/formStateUI.js';
import { isCreateMode } from '../../constants/formModes.js';
import { INVENTORY_RESOURCES } from '../../constants/inventory.js';
import { INPUT_SELECTORS } from '../../constants/selectors.js';
import { setMdbWrapperInputValue } from '../../plugins/mdb/baseInstance.js';
import { toggleErrorMessages } from '../forms/formErrorsUI.js';

export const updateMaterialMeasurementFields = ({ form }) => {
    const unitLabel = form.elements.unitMeasureId.selectedOptions?.[0]?.textContent?.trim() ?? '';
    const symbol = unitLabel.split(' - ')[0].toLowerCase();
    // RN-026: sólo metros y litros habilitan medidas; pieza no debe enviar valores anteriores.
    const usesMeasurements = /\b(?:metros?|litros?)\b/i.test(unitLabel)
        || /^(?:m[²³23]?|mt|mts|l|lt|lts)$/.test(symbol);
    const isVisible = form.dataset.resource !== INVENTORY_RESOURCES.CONSUMABLE && usesMeasurements;
    const isCreating = isCreateMode(form.dataset.mode);
    const fields = ['base', 'height'];

    setFormSectionVisibility({
        form,
        selector: '.material-measurements-section',
        isVisible,
        fieldNames: fields,
        clearValues: isCreating
    });
    setFormDisabled({ form, fields, isDisabled: !isVisible || !isCreating });
    if (!isVisible) toggleErrorMessages(form, { base: null, height: null });
};

export const updatePresentationDisplay = ({ modalSelector, data, presentation, option }) => {
    if (!option) return;

    Object.entries(data).forEach(([key, value]) => {
        option.dataset[key] = value;
    });

    setMdbWrapperInputValue({
        selector: `${ modalSelector } ${ INPUT_SELECTORS.PRESENTATION_DISPLAY }`,
        value: presentation.name || ''
    });
};
