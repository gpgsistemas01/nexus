import { DOM_EVENT_NAMES } from '../constants/events.js';
import { notifications } from "../plugins/swal/swalComponent.js";
import { getTimeZoneDateTimeParts } from '../utils/timeZone.js';
import { showReportExportDialog } from './reportExportDialog.js';

const getCurrentMexicoMonth = () => {
    const { year, month } = getTimeZoneDateTimeParts(new Date());

    return `${ year }-${ String(month).padStart(2, '0') }`;
};

export const buildTableExportParams = (table, params = {}) => {

    const [column = 0, dir = 'asc'] = table?.order?.()?.[0] || [];

    return {
        ...params,
        search: table?.search?.() || '',
        'order[0][column]': column,
        'order[0][dir]': dir
    };
};

export const buildExcelButton = ({
    filename = 'reporte.xlsx',
    request,
    allowMonthlyReport = true
} = {}) => ({
    text: 'Exportar Excel',
    className: 'datatable-export-button',
    action: async () => {
        if (typeof request !== 'function') {
            notifications.showError('No se pudo exportar el archivo. Inténtalo nuevamente.');
            return;
        }

        try {

            let reportType = allowMonthlyReport ? 'monthly' : 'custom';
            let reportMonth = '';

            if (allowMonthlyReport) {
                const result = await showReportExportDialog(getCurrentMexicoMonth());

                if (!result.isConfirmed) return;

                reportType = result.value.type;
                reportMonth = reportType === 'specificMonth' ? result.value.month : '';
            }

            const blob = await request({
                monthlyReport: reportType === 'monthly' || reportType === 'specificMonth',
                reportMonth
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');

            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

        } catch (err) {

            const message = err?.message || 'No se pudo exportar el archivo. Verifica tu conexión e inténtalo de nuevo.';
            notifications.showError(message);
        }
    }
});

export const clearTableFilters = () => {

    const filterElements = document.querySelectorAll(
        '.table-filters select, .table-filters input'
    );

    filterElements.forEach(element => {
        if (element.classList.contains('select2-hidden-accessible')) {
            $(element).val(null).trigger(DOM_EVENT_NAMES.CHANGE);
        } else {
            element.value = '';
            element.dispatchEvent(new Event(DOM_EVENT_NAMES.CHANGE));
        }
    });
}
