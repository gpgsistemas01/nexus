import { handleDataTableError, normalizeJqAjaxError } from "../../api/errorHandler.js";
import { exportWarehouseReportRequest } from "../../services/warehouse/reportService.js";

const downloadBlob = ({ blob, filename }) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
};

export const buildExcelButton = ({ filename = 'reporte.xlsx' } = {}) => ({
    text: 'Exportar Excel',
    action: async () => {
        const response = await exportWarehouseReportRequest();
        downloadBlob({ blob: response.data, filename });
    }
});

export const createDataTable = ({ selector = '#table', options = {} }) => {

    const ajaxConfig = options.ajax;

    return $(selector).DataTable({
        ...options,
        ajax: ajaxConfig ? async (data, callback) => {

            try {

                const response = await ajaxConfig.get(data);

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
        },
        responsive: true,
        autoWidth: false,
        serverSide: options.ajax ? true : false,
        processing: options.ajax ? true : false,
    });
}

export const reloadMainTable = () => {

    const table = $('#table').DataTable();
    table.ajax.reload(null, false);
}

export const refreshProductTable = (details) => {

    const table = $('#productTable').DataTable();
    table.clear();
    table.rows.add(details);
    table.draw();
}

export const renderActionButtons = ({ status, fulfillmentStatus, context }) => {

    const actions = [];
    const canEditGoodsIssue = context === 'goodsIssue' && fulfillmentStatus === 'Pendiente';

    if (status === 'Abierta' || canEditGoodsIssue) actions.push('<button class="btn-edit"><i class="fa-solid fa-pencil"></i></button>');

    if (status === 'Aprobada' && context === 'goodsIssue' && canEditGoodsIssue) actions.push('<button class="btn-edit-detail"><i class="fa fa-edit"></i></button>');

    if (context !== 'product') actions.push('<button class="btn-view"><i class="fa fa-eye"></i></button>');

    return actions.join('');
}
