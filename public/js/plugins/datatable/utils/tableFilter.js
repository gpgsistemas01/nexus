import { getAllFulfillmentStatusesRequest } from "../../../services/warehouse/fulfillmentStatusService.js";

const createTableSelectFilter = ({
    id,
    label,
    tableSelector = '#table'
}) => {

    const selector = `#${ id }`;

    if (!document.querySelector(selector)) {
        const filterContainer = document.createElement('div');
        filterContainer.className = 'mb-3';
        filterContainer.innerHTML = `
            <label for="${ id }" class="form-label">${ label }</label>
            <select id="${ id }" class="form-select"></select>
        `;

        const tableElement = document.querySelector(tableSelector);
        const tableWrapper = tableElement?.closest('.dataTables_wrapper');

        if (tableWrapper) {
            tableWrapper.parentNode.insertBefore(filterContainer, tableWrapper);
        } else if (tableElement?.parentNode) {
            tableElement.parentNode.insertBefore(filterContainer, tableElement);
        }
    }

    return document.querySelector(selector);
};

export const setupTableSelectFilter = async ({
    id = '',
    label = '',
    tableSelector = '#table',
    loadOptions = null,
    preset = '',
    table = null,
    onChange,
    onEmptyText = 'Sin opciones disponibles',
    onErrorText = 'Error cargando opciones'
}) => {
    const presets = {
        fulfillmentStatus: {
            id: 'fulfillmentStatusFilter',
            label: 'Filtrar por estado surtido',
            loadOptions: async () => {
                const response = await getAllFulfillmentStatusesRequest({ length: 50 });
                return (response.data?.data || [])
                    .filter(status => status?.id && status?.name)
                    .map(status => ({ value: status.id, label: status.name }));
            }
        }
    };

    const resolved = preset ? presets[preset] : null;
    const resolvedId = resolved?.id || id;
    const resolvedLabel = resolved?.label || label;
    const resolvedLoadOptions = resolved?.loadOptions || loadOptions;

    if (!resolvedId || !resolvedLabel || typeof resolvedLoadOptions !== 'function') {
        return { select: null, options: [] };
    }

    const select = createTableSelectFilter({ id: resolvedId, label: resolvedLabel, tableSelector });
    if (!select) return { select: null, options: [] };

    try {
        const options = await resolvedLoadOptions();

        if (!options.length) {
            select.innerHTML = `<option value="" selected disabled>${ onEmptyText }</option>`;
            select.disabled = true;
            return { select, options: [], selector: `#${ resolvedId }` };
        }

        select.innerHTML = options
            .map(option => `<option value="${ option.value }">${ option.label }</option>`)
            .join('');
        select.disabled = false;
        select.value = options[0].value;

        const selector = `#${ resolvedId }`;
        const validValues = new Set(options.map(option => option.value));

        if (typeof onChange === 'function' || table?.ajax?.reload) {
            $(document).off('change', selector).on('change', selector, () => {
                const value = select.value || '';
                if (value && !validValues.has(value)) {
                    select.value = options[0]?.value || '';
                }
                const selectedValue = select.value || '';
                onChange?.(selectedValue, { select, options, validValues, selector });
                table?.ajax?.reload(null, true);
            });
        }

        return {
            select,
            options,
            validValues,
            selector,
            getValue: () => document.querySelector(selector)?.value
        };
    } catch {
        select.innerHTML = `<option value="" selected disabled>${ onErrorText }</option>`;
        select.disabled = true;
        return { select, options: [], selector: `#${ resolvedId }` };
    }
};
