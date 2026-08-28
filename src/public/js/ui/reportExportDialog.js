import { notifications } from '../plugins/swal/swalComponent.js';
import { initMonthPickers, setMonthPickerDisabled } from '../plugins/flatpickr/dateTimePicker.js';

const REPORT_TYPE_NAME = 'reportType';

const createReportOption = ({ value, label, checked = false, content }) => {
    const option = document.createElement('div');
    const inputId = `${ value }ReportRadio`;

    option.className = 'form-check report-export-option';
    option.innerHTML = `
        <input class="form-check-input" type="radio" name="${ REPORT_TYPE_NAME }" id="${ inputId }" value="${ value }" ${ checked ? 'checked' : '' }>
        <label class="form-check-label" for="${ inputId }">${ label }</label>
    `;

    if (content) option.append(content);

    return option;
};

export const createReportExportContent = (currentMonth) => {
    const content = document.createElement('div');
    const monthInput = document.createElement('input');

    content.className = 'text-start report-export-options';
    content.innerHTML = '<p class="mb-3">Selecciona el alcance del reporte que deseas descargar.</p>';
    monthInput.className = 'form-control mt-2 js-flatpickr-month';
    monthInput.type = 'text';
    monthInput.id = 'reportMonth';
    monthInput.value = currentMonth;
    monthInput.disabled = true;
    monthInput.setAttribute('aria-label', 'Mes del reporte');

    content.append(
        createReportOption({ value: 'monthly', label: 'Mes actual', checked: true }),
        createReportOption({ value: 'specificMonth', label: 'Otro mes', content: monthInput }),
        createReportOption({ value: 'custom', label: 'Personalizado: usar filtros aplicados' })
    );

    return content;
};

export const showReportExportDialog = (currentMonth) => notifications.showDialog({
    title: 'Exportar reporte',
    html: createReportExportContent(currentMonth),
    popupClass: 'report-export-modal',
    confirmButtonText: 'Descargar',
    didOpen: () => {
        const monthInput = document.querySelector('#reportMonth');

        initMonthPickers();
        document.querySelectorAll(`input[name="${ REPORT_TYPE_NAME }"]`).forEach(input => {
            input.addEventListener('change', () => {
                setMonthPickerDisabled(monthInput, input.value !== 'specificMonth' || !input.checked);
            });
        });
    },
    preConfirm: () => {
        const type = document.querySelector(`input[name="${ REPORT_TYPE_NAME }"]:checked`)?.value || 'monthly';
        const month = document.querySelector('#reportMonth')?.value || '';

        if (type === 'specificMonth' && !month) {
            Swal.showValidationMessage('Selecciona el mes que deseas exportar.');
            return false;
        }

        return { type, month };
    }
});
