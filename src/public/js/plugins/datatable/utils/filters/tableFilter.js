import { clearTableFilters, isClearingFilters } from "../../../../ui/tableUI.js";
import { on } from "../../../../utils/domUtils.js";
import { DATATABLE_SELECTORS, FILTER_SELECTORS } from "../../../../constants/selectors.js";
import { buildTableFilterConfigs } from "./tableFilterConfigs.js";
import { bindTableFilterDependencies } from "./tableFilterDependencies.js";

const getDataTable = (selector = DATATABLE_SELECTORS.MAIN) => {

    if (!$.fn.DataTable.isDataTable(selector)) return null;

    return $(selector).DataTable();
};

const attachClearFiltersHandler = (selector = DATATABLE_SELECTORS.MAIN) => {

    on('click', FILTER_SELECTORS.CLEAR_BUTTON, (e) => {

        clearTableFilters(getDataTable(selector));

        e.target.blur();
    });
};

export const setupTableFilters = async ({
    fields = [],
    selector = DATATABLE_SELECTORS.MAIN
} = {}) => {

    const onChange = () => {

        if (isClearingFilters) return;

        getDataTable(selector)?.ajax.reload();
    };

    attachClearFiltersHandler(selector);
    bindTableFilterDependencies(fields);

    const filters = buildTableFilterConfigs({
        fields,
        onChange
    });

    const values = {};

    for (const filter of filters) {

        const {
            key,
            isSelected = true,
            getSelectApi,
            getOptions = async () => [],
            initSelect,
            attachHandler,
            defaultSelectedLabel
        } = filter;

        if (filter.customGetValues) {

            values[key || crypto.randomUUID()] = filter.customGetValues;

            if (attachHandler) attachHandler({ onChange });

            continue;
        }

        const { getSelect, getValue } = getSelectApi();

        const select = getSelect();

        if (!select) continue;

        const options = await getOptions();

        select.options.length = 0;

        options.forEach((option) => {
            select.add(
                new Option(
                    option.label ?? option.text,
                    option.value ?? option.id,
                    false,
                    false
                )
            );
        });

        const defaultSelectedOption = defaultSelectedLabel
            ? options.find(option => option.label === defaultSelectedLabel || option.text === defaultSelectedLabel)
            : options[0];

        initSelect({
            selectedId: isSelected ? defaultSelectedOption?.value : null
        });

        if (attachHandler) attachHandler({ onChange });

        values[key] = () => ({
            [key]: getValue?.() || ''
        });
    }

    return {
        getValues: () => {
            return Object.assign(
                {},
                ...Object.values(values).map(getter => getter())
            );
        }
    };
};
