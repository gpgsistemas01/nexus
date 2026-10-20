import { handleApiError } from '../../../../api/errorHandler.js';
import { DATATABLE_SELECTORS } from '../../../../constants/selectors.js';
import { mergeMainTableColumnDefs } from '../responsive/columnDefs.js';
import { renderResponsiveDetails } from '../responsive/detailsRenderer.js';
import { configureResponsiveHeaderGroups } from '../responsive/headerGroups.js';
import { normalizeColumns } from './columnOptions.js';
import {
    adjustDataTableColumns,
    getLastAvailableDataTablePage,
    initDataTableMdbComponents
} from './tableLifecycle.js';

const MAX_AJAX_ATTEMPTS = 2;
const AJAX_RETRY_DELAY_MS = 500;
const RETRYABLE_HTTP_STATUSES = new Set([0, 408, 502, 503, 504]);

const getAjaxDataSource = (ajax) => {
    if (!ajax) return undefined;

    let latestRequest = 0;

    return async (data, callback, settings) => {
        const request = ++latestRequest;

        for (let attempt = 1; attempt <= MAX_AJAX_ATTEMPTS; attempt++) {
            if (request !== latestRequest || settings?.bDestroying) return;

            let response;

            try {
                response = await ajax.get(data);
            } catch (error) {
                if (request !== latestRequest || settings?.bDestroying) return;

                // Sólo las lecturas con fallos transitorios se reintentan; un 500 se informa de inmediato.
                const canRetry = attempt < MAX_AJAX_ATTEMPTS && RETRYABLE_HTTP_STATUSES.has(error.status);

                if (canRetry) {
                    await new Promise(resolve => setTimeout(resolve, AJAX_RETRY_DELAY_MS));
                    continue;
                }

                handleApiError({ err: error });
                callback({ draw: data.draw, data: [], recordsTotal: 0, recordsFiltered: 0 });
                return;
            }

            if (request !== latestRequest || settings?.bDestroying) return;

            callback(response.data);
            return;
        }
    };
};

export const createDataTable = ({ selector = DATATABLE_SELECTORS.MAIN, options = {} }) => {
    const {
        ajax,
        columns,
        initComplete,
        drawCallback,
        language = {},
        dom = "<'datatable-toolbar'Bf>rtip",
        searchPlaceholder = 'Buscar en la tabla',
        responsive = true,
        autoWidth = false,
        columnDefs,
        ...dataTableOptions
    } = options;
    const resolvedSearchPlaceholder = language.searchPlaceholder || searchPlaceholder;

    return $(selector).DataTable({
        ...dataTableOptions,
        columns: normalizeColumns(columns),
        columnDefs: mergeMainTableColumnDefs(selector, columnDefs),
        searchDelay: 1000,
        ajax: getAjaxDataSource(ajax),
        dom,
        language: {
            url: 'https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json',
            searchPlaceholder: resolvedSearchPlaceholder,
            ...language
        },
        initComplete(settings, json) {
            const table = this.api();

            adjustDataTableColumns(table);
            initDataTableMdbComponents(table);
            configureResponsiveHeaderGroups(table);

            $(table.table().container())
                .find('.dataTables_filter input')
                .attr('placeholder', resolvedSearchPlaceholder);

            if (typeof initComplete === 'function') initComplete.call(this, settings, json);
        },
        drawCallback(settings) {
            const table = this.api();
            const lastAvailablePage = getLastAvailableDataTablePage(table.page.info());

            if (lastAvailablePage !== null) {
                table.page(lastAvailablePage).draw('page');
                return;
            }

            adjustDataTableColumns(table);
            initDataTableMdbComponents(table);

            if (typeof drawCallback === 'function') drawCallback.call(this, settings);
        },
        responsive: responsive === false ? false : {
            details: { type: 'inline', renderer: renderResponsiveDetails }
        },
        autoWidth,
        serverSide: Boolean(ajax),
        processing: Boolean(ajax)
    });
};
