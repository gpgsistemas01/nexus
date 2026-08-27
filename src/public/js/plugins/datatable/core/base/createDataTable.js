import { handleDataTableError } from '../../../../api/errorHandler.js';
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

const getAjaxDataSource = (ajax) => ajax ? async (data, callback) => {
    try {
        const response = await ajax.get(data);
        callback(response.data);
    } catch (error) {
        handleDataTableError(error);
        callback({ data: [], recordsTotal: 0, recordsFiltered: 0 });
    }
} : undefined;

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
