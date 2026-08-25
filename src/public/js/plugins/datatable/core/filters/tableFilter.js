import { DOM_EVENT_NAMES } from '../../../../constants/events.js';
import { clearTableFilters } from "../../../../ui/tableUI.js";
import { on } from "../../../../utils/domUtils.js";
import { DATATABLE_SELECTORS, FILTER_SELECTORS } from "../../../../constants/selectors.js";
import { buildTableFilterConfigs } from "./tableFilterConfigs.js";
import { bindTableFilterDependencies } from "./tableFilterDependencies.js";
import { SELECT_RESULTS_LIMIT } from "../../../select2/baseSelect.js";
import { createTableFilterState } from "./tableFilterState.js";

const TABLE_FILTERS_FORM_SELECTOR = '#tableFiltersForm';

export const setupTableFilters = async ({
    fields = [],
    selector = DATATABLE_SELECTORS.MAIN
} = {}) => {

    const filters = buildTableFilterConfigs({
        fields
    });

    bindTableFilterDependencies(filters);

    const values = {};

    for (const filter of filters) {

        const {
            key,
            selector: filterSelector,
            isSelected = true,
            getOptions = async () => [],
            initSelect,
            defaultSelectedLabel
        } = filter;

        if (filter.customGetValues) {

            values[key || crypto.randomUUID()] = filter.customGetValues;

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

        values[key] = () => ({
            [key]: select.value || ''
        });
    }

    const filterState = createTableFilterState(values);
    filterState.apply();

    on(DOM_EVENT_NAMES.CLICK, FILTER_SELECTORS.CLEAR_BUTTON, (e) => {
        const table = $.fn.DataTable.isDataTable(selector) ? $(selector).DataTable() : null;

        clearTableFilters();
        filterState.apply();
        table?.ajax.reload();

        e.target.blur();
    });

    on(DOM_EVENT_NAMES.SUBMIT, TABLE_FILTERS_FORM_SELECTOR, (e) => {
        const table = $.fn.DataTable.isDataTable(selector) ? $(selector).DataTable() : null;

        e.preventDefault();
        filterState.apply();
        table?.ajax.reload();
        e.submitter?.blur?.();
    });

    return filterState;
};
