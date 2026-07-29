import { clearTableFilters, isClearingFilters } from "../../../../ui/tableUI.js";
import { on } from "../../../../utils/domUtils.js";
import { DATATABLE_SELECTORS, FILTER_SELECTORS } from "../../../../constants/selectors.js";
import { buildTableFilterConfigs } from "./tableFilterConfigs.js";
import { bindTableFilterDependencies } from "./tableFilterDependencies.js";
import { SELECT_RESULTS_LIMIT } from "../../../select2/baseSelect.js";

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

const attachApplyFiltersHandler = (selector = DATATABLE_SELECTORS.MAIN) => {

    on('click', FILTER_SELECTORS.APPLY_BUTTON, (e) => {

        getDataTable(selector)?.ajax.reload();

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
    attachApplyFiltersHandler(selector);
    bindTableFilterDependencies(fields);

    const filters = buildTableFilterConfigs({
        fields,
        onChange
    });

    const values = {};

    for (const filter of filters) {

        const {
            key,
            selector: filterSelector,
            isSelected = true,
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

        const select = document.querySelector(filterSelector);

        if (!select) continue;

        const options = await getOptions({
            start: 0,
            length: SELECT_RESULTS_LIMIT
        });

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
            selectedId: isSelected
                ? defaultSelectedOption?.value ?? defaultSelectedOption?.id
                : null
        });

        if (attachHandler) attachHandler({ onChange });

        values[key] = () => ({
            [key]: select.value || ''
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
