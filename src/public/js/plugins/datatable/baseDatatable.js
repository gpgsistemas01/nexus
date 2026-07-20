import { DATATABLE_SELECTORS } from "../../constants/selectors.js";
import { handleDataTableError } from "../../api/errorHandler.js";
import { buildMdbActionButton } from "../mdb/actionButton.js";
import { initMdbTooltips } from "../mdb/baseInstance.js";
import { configureResponsiveHeaderGroups, mergeMainTableColumnDefs, renderResponsiveDetails } from "./utils/responsive.js";

const SORT_DIRECTIONS = ['asc', 'desc'];
const isActionColumn = (column = {}) => column.title === 'Acciones';

const getLastAvailableDataTablePage = (pageInfo = {}) => {

    const recordsDisplay = Number(pageInfo.recordsDisplay) || 0;
    const pages = Number(pageInfo.pages) || 0;

    if (recordsDisplay <= 0 || pages <= 0 || pageInfo.page < pages) return null;

    return pages - 1;
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

const adjustDataTableColumns = (table) => {

    if (typeof table?.columns?.adjust !== 'function') return;

    table.columns.adjust();

    if (typeof table?.responsive?.recalc === 'function') table.responsive.recalc();
};

const initDataTableMdbComponents = (table) => {

    const tableNode = table?.table?.().node?.();

    if (!tableNode) return;

    initMdbTooltips(tableNode);
};

export const createDataTable = ({ selector = DATATABLE_SELECTORS.MAIN, options = {} }) => {

    const {
        ajax,
        columns,
        initComplete,
        drawCallback,
        language = {},
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
        ajax: ajax ? async (data, callback) => {

            try {

                const response = await ajax.get(data);

                callback(response.data);

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
            details: {
                type: 'inline',
                renderer: renderResponsiveDetails
            }
        },
        autoWidth,
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

const DOCUMENT_STATUS_LABELS = Object.freeze({
    APPROVED: 'Aprobada',
    CONFIRMED: 'Confirmada',
    CANCELED: 'Cancelada'
});

export const renderActionButtons = ({ status, fulfillmentStatus, context, canAdjustStock = false, canDeleteProduct = false }) => {

    const actions = [];
    const canEditGoodsIssue = context === 'goodsIssue' && status === DOCUMENT_STATUS_LABELS.APPROVED;
    const canSupplyGoodsIssue = context === 'goodsIssue' && ['Pendiente', 'Surtido parcial'].includes(fulfillmentStatus);
    const canEditGoodsReceipt = context === 'goodsReceipt' && status !== DOCUMENT_STATUS_LABELS.CANCELED;
    const canViewGoodsReceipt = context === 'goodsReceipt' && status === DOCUMENT_STATUS_LABELS.CANCELED;

    if (canViewGoodsReceipt) actions.push(buildMdbActionButton({
        className: 'btn-edit',
        colorClass: 'btn-secondary',
        iconClass: 'fa-solid fa-eye',
        title: 'Ver',
        ariaLabel: 'Ver registro'
    }));

    if ((status === 'Abierta' || canEditGoodsIssue) || canEditGoodsReceipt || context === 'profile' || context === 'client' || context === 'supplier') actions.push(buildMdbActionButton({
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

    if (context === 'product' && canDeleteProduct) actions.push(buildMdbActionButton({
        className: 'btn-delete-product',
        colorClass: 'btn-danger',
        iconClass: 'fa-solid fa-trash',
        title: 'Eliminar producto',
        ariaLabel: 'Eliminar producto'
    }));

    if (status === DOCUMENT_STATUS_LABELS.APPROVED && context === 'goodsIssue' && canSupplyGoodsIssue) actions.push(buildMdbActionButton({
        className: 'btn-edit-detail',
        colorClass: 'btn-info',
        iconClass: 'fa fa-edit',
        title: 'Surtir detalle',
        ariaLabel: 'Surtir detalle'
    }));

    return actions.join('');
}
