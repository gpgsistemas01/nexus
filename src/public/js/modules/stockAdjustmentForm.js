import { setFormReadOnly, toggleFormFields } from "../ui/formUI.js";

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
    showStockFields,
    isStockAdjustment = false
}) => {

    toggleFormFields({ form, fields: dataFields, isVisible: true });
    toggleFormFields({ form, fields: stockFields, isVisible: showStockFields });
    form.querySelector(stockSectionSelector)?.classList.toggle('d-none', !showStockFields);
    setFormReadOnly({ form, fields: dataFields, isReadOnly: isStockAdjustment });
};
