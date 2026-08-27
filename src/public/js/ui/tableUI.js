import { DOM_EVENT_NAMES } from '../constants/events.js';
import { notifications } from "../plugins/swal/swalComponent.js";
import { getTimeZoneDateTimeParts } from '../utils/timeZone.js';

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
                const result = await Swal.fire({
                    title: 'Exportar reporte',
                    html: `
                        <div class="text-start report-export-options">
                            <p class="mb-3">Selecciona el alcance del reporte que deseas descargar.</p>
                            <div class="form-check mb-2 report-export-option">
                                <input class="form-check-input" type="radio" name="reportType" id="monthlyReportRadio" value="monthly" checked>
                                <label class="form-check-label" for="monthlyReportRadio">
                                    Mes actual
                                </label>
                            </div>
                            <div class="form-check mb-2 report-export-option">
                                <input class="form-check-input" type="radio" name="reportType" id="specificMonthReportRadio" value="specificMonth">
                                <label class="form-check-label" for="specificMonthReportRadio">
                                    Otro mes
                                </label>
                                <input class="form-control mt-2" type="month" id="reportMonth" value="${ getCurrentMexicoMonth() }" disabled>
                            </div>
                            <div class="form-check report-export-option">
                                <input class="form-check-input" type="radio" name="reportType" id="customReportRadio" value="custom">
                                <label class="form-check-label" for="customReportRadio">
                                    Personalizado: usar filtros aplicados
                                </label>
                            </div>
                        </div>
                    `,
                    showCancelButton: true,
                    reverseButtons: true,
                    confirmButtonText: 'Descargar',
                    cancelButtonText: 'Cancelar',
                    buttonsStyling: false,
                    customClass: {
                        popup: 'report-export-modal',
                        title: 'report-export-title',
                        htmlContainer: 'report-export-content',
                        confirmButton: 'btn btn-primary',
                        cancelButton: 'btn btn-outline-primary report-export-cancel-button ms-2'
                    },
                    didOpen: () => {
                        const monthInput = document.querySelector('#reportMonth');
                        document.querySelectorAll('input[name="reportType"]').forEach(input => {
                            input.addEventListener('change', () => {
                                monthInput.disabled = input.value !== 'specificMonth' || !input.checked;
                            });
                        });
                    },
                    preConfirm: () => {
                        const type = document.querySelector('input[name="reportType"]:checked')?.value || 'monthly';
                        const month = document.querySelector('#reportMonth')?.value || '';

                        if (type === 'specificMonth' && !month) {
                            Swal.showValidationMessage('Selecciona el mes que deseas exportar.');
                            return false;
                        }

                        return { type, month };
                    }
                });

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
