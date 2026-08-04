import { setFormDisabled, toggleFormFields } from "../ui/formUI.js";

export const shouldShowStockAdjustmentFields = ({
    mode,
    includeStockAdjustmentOnCreate = false,
    isStockAdjustment = false
}) => isStockAdjustment || (mode === 'create' && includeStockAdjustmentOnCreate);

export const configureStockAdjustmentForm = ({
    form,
    dataFields,
    stockFields,
    stockSectionSelector = '.stock-data-section',
    showStockFields
}) => {

    toggleFormFields({ form, fields: dataFields, isVisible: true });
    toggleFormFields({ form, fields: stockFields, isVisible: showStockFields });
    form.querySelector(stockSectionSelector)?.classList.toggle('d-none', !showStockFields);
};

export const setupStockAdjustmentForm = ({
    form,
    dataFields,
    stockFields,
    stockSectionSelector = '.stock-data-section',
    showStockFields,
    isStockAdjustment = false
}) => {

    setFormDisabled({ form, isDisabled: false });
    configureStockAdjustmentForm({
        form,
        dataFields,
        stockFields,
        stockSectionSelector,
        showStockFields
    });

    if (!isStockAdjustment) return;

    setFormDisabled({ form, fields: dataFields, isDisabled: true });
    setFormDisabled({ form, fields: stockFields, isDisabled: false });
};
