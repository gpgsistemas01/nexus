import { DATATABLE_SELECTORS } from "../../constants/selectors.js";
import { handleDataTableError } from "../../api/errorHandler.js";
import { buildMdbActionButton } from "../mdb/actionButton.js";

const SORT_DIRECTIONS = ['asc', 'desc'];

const isActionColumn = (column = {}) => column.title === 'Acciones';

export const getFallbackPageForEmptyDataTableResponse = ({ requestData = {}, responseData = {} } = {}) => {

    const start = Number(requestData.start) || 0;
    const length = Number(requestData.length) || 0;
    const recordsFiltered = Number(responseData.recordsFiltered) || 0;
    const currentPage = length > 0 ? Math.floor(start / length) : 0;
    const totalPages = length > 0 ? Math.ceil(recordsFiltered / length) : 0;

    if (start <= 0 || length <= 0 || recordsFiltered <= 0 || !Array.isArray(responseData.data) || responseData.data.length > 0) {
        return null;
    }

    const lastAvailablePage = Math.max(totalPages - 1, 0);
    const fallbackPage = Math.min(currentPage - 1, lastAvailablePage);

    return fallbackPage >= 0 && fallbackPage !== currentPage ? fallbackPage : null;
};

const normalizeColumns = (columns) => {

    if (!Array.isArray(columns)) return columns;

    return columns.map(column => ({
        ...column,
        orderSequence: column.orderSequence || SORT_DIRECTIONS,
        ...(isActionColumn(column) && {
            orderable: false,
            searchable: false
        })
    }));
};

export const createDataTable = ({ selector = DATATABLE_SELECTORS.MAIN, options = {} }) => {

    const {
        ajax,
        columns,
        initComplete,
        language = {},
        searchPlaceholder = 'Buscar en la tabla',
        ...dataTableOptions
    } = options;
    const resolvedSearchPlaceholder = language.searchPlaceholder || searchPlaceholder;

    return $(selector).DataTable({
        ...dataTableOptions,
        columns: normalizeColumns(columns),
        searchDelay: 1000,
        ajax: ajax ? async (data, callback, settings) => {

            try {

                const response = await ajax.get(data);
                const fallbackPage = getFallbackPageForEmptyDataTableResponse({
                    requestData: data,
                    responseData: response.data
                });

                callback(response.data);

                if (fallbackPage !== null) {
                    setTimeout(() => new $.fn.dataTable.Api(settings).page(fallbackPage).draw('page'), 0);
                }

            } catch (err) {

                handleDataTableError(err);

                callback({
                    data: [],
                    recordsTotal: 0,
                    recordsFiltered: 0
                });
            }
        } : undefined,
        dom: 'Bfrtip',
        language: {
            url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json",
            searchPlaceholder: resolvedSearchPlaceholder,
            ...language
        },
        initComplete(settings, json) {
            $(this.api().table().container())
                .find('.dataTables_filter input')
                .attr('placeholder', resolvedSearchPlaceholder);

            if (typeof initComplete === 'function') initComplete.call(this, settings, json);
        },
        responsive: true,
        autoWidth: false,
        serverSide: Boolean(ajax),
        processing: Boolean(ajax),
    });
}

export const reloadMainTable = ({ resetPaging = false } = {}) => {

    const table = $(DATATABLE_SELECTORS.MAIN).DataTable();
    table.ajax.reload(null, resetPaging);
}

export const refreshProductTable = (details) => {

    const table = $(DATATABLE_SELECTORS.PRODUCT).DataTable();
    table.clear();
    table.rows.add(details);
    table.draw();
}

export const renderActionButtons = ({ status, fulfillmentStatus, context, canAdjustStock = false, canReturnProduct = false }) => {

    const actions = [];
    const canEditGoodsIssue = context === 'goodsIssue' && fulfillmentStatus === 'Pendiente';
    const canSupplyGoodsIssue = context === 'goodsIssue' && ['Pendiente', 'Surtido parcial'].includes(fulfillmentStatus);

    if ((status === 'Abierta' || canEditGoodsIssue) || context === 'profile' || context === 'client' || context === 'supplier') actions.push(buildMdbActionButton({
        className: 'btn-edit',
        colorClass: 'btn-primary',
        iconClass: 'fa-solid fa-pencil',
        title: 'Editar',
        ariaLabel: 'Editar registro'
    }));

    if ((context === 'product' || context === 'waste') && canAdjustStock) actions.push(buildMdbActionButton({
        className: 'btn-adjust-stock',
        colorClass: 'btn-success',
        iconClass: 'fa-solid fa-boxes-stacked',
        title: 'Ajustar stock',
        ariaLabel: 'Ajustar stock'
    }));

    if (context === 'product' && canReturnProduct) actions.push(buildMdbActionButton({
        className: 'btn-return-product',
        colorClass: 'btn-warning',
        iconClass: 'fa-solid fa-rotate-left',
        title: 'Devolver producto',
        ariaLabel: 'Devolver producto',
        rippleColor: 'dark'
    }));

    if (status === 'Aprobada' && context === 'goodsIssue' && canSupplyGoodsIssue) actions.push(buildMdbActionButton({
        className: 'btn-edit-detail',
        colorClass: 'btn-info',
        iconClass: 'fa fa-edit',
        title: 'Surtir detalle',
        ariaLabel: 'Surtir detalle'
    }));

    if (context !== 'product' && context !== 'waste' && context !== 'profile' && context !== 'client' && context !== 'supplier') actions.push(buildMdbActionButton({
        className: 'btn-view',
        colorClass: 'btn-secondary',
        iconClass: 'fa fa-eye',
        title: 'Ver detalle',
        ariaLabel: 'Ver detalle'
    }));

    return actions.join('');
}
