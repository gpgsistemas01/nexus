import { downloadBlob } from "../utils/downloadBlob.js";
import { notifications } from "../plugins/swal/swalComponent.js";

export let isClearingFilters = false;


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
    action: async () => {
        if (typeof request !== 'function') {
            notifications.showError('No se pudo exportar el archivo. Inténtalo nuevamente.');
            return;
        }

        try {

            let reportType = 'custom';

            if (allowMonthlyReport) {
                const result = await Swal.fire({
                    title: 'Exportar reporte',
                    html: `
                        <div class="text-start">
                            <p class="mb-3">Selecciona el alcance del reporte que deseas descargar.</p>
                            <div class="form-check mb-2">
                                <input class="form-check-input" type="radio" name="reportType" id="customReportRadio" value="custom" checked>
                                <label class="form-check-label" for="customReportRadio">
                                    Personalizado: usar filtros aplicados
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="reportType" id="monthlyReportRadio" value="monthly">
                                <label class="form-check-label" for="monthlyReportRadio">
                                    Mensual: todos los registros del mes actual
                                </label>
                            </div>
                        </div>
                    `,
                    showCancelButton: true,
                    confirmButtonText: 'Descargar',
                    cancelButtonText: 'Cancelar',
                    preConfirm: () => document.querySelector('input[name="reportType"]:checked')?.value || 'custom'
                });

                if (!result.isConfirmed) return;

                reportType = result.value;
            }

            const blob = await request({ monthlyReport: reportType === 'monthly' });
            downloadBlob({ blob, filename });

        } catch (err) {

            const message = err?.message || 'No se pudo exportar el archivo. Verifica tu conexión e inténtalo de nuevo.';
            notifications.showError(message);
        }
    }
});

export const clearTableFilters = (table) => {

    isClearingFilters = true;

    const filterElements = document.querySelectorAll(
        '.table-filters select, .table-filters input'
    );

    filterElements.forEach(element => {
        if (element.classList.contains('select2-hidden-accessible')) {
            $(element).val(null).trigger('change');
        } else {
            element.value = '';
            element.dispatchEvent(new Event('change'));
        }
    });

    isClearingFilters = false;

    table.ajax.reload();
}