import { DATATABLE_SELECTORS } from "../../constants/selectors.js";
import { handleDataTableError } from "../../api/errorHandler.js";
import {
    buildMdbAdjustStockActionButton,
    buildMdbActionButton,
    buildMdbDeleteActionButton,
    buildMdbEditActionButton,
    buildMdbEditDetailActionButton,
    buildMdbReturnActionButton,
    buildMdbSupplyActionButton,
    buildMdbViewActionButton
} from "../mdb/actionButton.js";
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
        dom,
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

export const refreshDataTable = ({ selector, data }) => {
    const table = $(selector).DataTable();
    table.clear();
    table.rows.add(data);
    table.draw();
};

export const resetDataTable = selector => {
    if (!$.fn.DataTable.isDataTable(selector)) return;

    $(selector).DataTable().clear().destroy();
    $(selector).empty();
};

const DOCUMENT_STATUS_LABELS = Object.freeze({
    APPROVED: 'Aprobada',
    CONFIRMED: 'Confirmada',
    CANCELED: 'Cancelada'
});

const EDITABLE_ACTION_CONTEXTS = new Set(['person', 'client', 'supplier']);
const SUPPLY_FULFILLMENT_STATUSES = new Set(['Pendiente', 'Surtido parcial']);
const ACTION_BUTTONS = Object.freeze({
    view: buildMdbViewActionButton({
        className: 'btn-edit',
        label: 'Ver registro'
    }),
    edit: buildMdbEditActionButton({
        className: 'btn-edit',
        label: 'Editar registro'
    }),
    adjustStock: buildMdbAdjustStockActionButton({
        className: 'btn-adjust-stock',
        label: 'Ajustar stock'
    }),
    deleteMaterial: buildMdbDeleteActionButton({
        className: 'btn-delete-material',
        label: 'Eliminar material'
    }),
    deleteWaste: buildMdbDeleteActionButton({
        className: 'btn-delete-waste',
        label: 'Eliminar merma'
    }),
    supplyDetail: buildMdbSupplyActionButton({
        className: 'btn-edit-detail',
        label: 'Surtir detalle'
    }),
    returnDetail: buildMdbReturnActionButton({
        className: 'btn-return-detail',
        label: 'Devolver material surtido'
    })
});

const normalizeActionButtonOptions = (options = {}) => typeof options === 'string'
    ? { status: options }
    : options || {};

export const renderActionButtons = (options = {}) => {

    const {
        status,
        fulfillmentStatus,
        context,
        canManage = true,
        canSupply = true,
        canAdjustStock = false,
        canDeleteMaterial = false,
        canDeleteWaste = false
    } = normalizeActionButtonOptions(options);
    const isGoodsIssue = context === 'goodsIssue';
    const isWasteIssue = context === 'wasteIssue';
    const isIssue = isGoodsIssue || isWasteIssue;
    const isGoodsReceipt = context === 'goodsReceipt';
    const isApproved = status === DOCUMENT_STATUS_LABELS.APPROVED;
    const isCanceled = status === DOCUMENT_STATUS_LABELS.CANCELED;
    const isInventoryItem = context === 'material' || context === 'waste';

    return [
        [((isIssue || isGoodsReceipt) && isCanceled), ACTION_BUTTONS.view],
        [
            canManage && (
                status === 'Abierta'
                || (isIssue && isApproved)
                || (isGoodsReceipt && !isCanceled)
                || EDITABLE_ACTION_CONTEXTS.has(context)
            ),
            ACTION_BUTTONS.edit
        ],
        [isInventoryItem && canAdjustStock, ACTION_BUTTONS.adjustStock],
        [context === 'material' && canDeleteMaterial, ACTION_BUTTONS.deleteMaterial],
        [context === 'waste' && canDeleteWaste, ACTION_BUTTONS.deleteWaste],
        [canSupply && isIssue && isApproved && SUPPLY_FULFILLMENT_STATUSES.has(fulfillmentStatus), ACTION_BUTTONS.supplyDetail],
        [canSupply && isIssue && isApproved && fulfillmentStatus === 'Surtido', ACTION_BUTTONS.returnDetail]
    ]
        .filter(([canRender]) => canRender)
        .map(([, button]) => button)
        .join('');
}
