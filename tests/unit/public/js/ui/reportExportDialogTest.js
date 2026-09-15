import { beforeEach, describe, expect, it, vi } from 'vitest';

const showDialog = vi.fn();

vi.mock('../../../../../src/public/js/plugins/swal/swalComponent.js', () => ({
  notifications: { showDialog }
}));

vi.mock('../../../../../src/public/js/plugins/flatpickr/dateTimePicker.js', () => ({
  initMonthPickers: vi.fn(),
  setMonthPickerDisabled: vi.fn()
}));

const { showFilteredExportDialog } = await import('../../../../../src/public/js/ui/reportExportDialog.js');

describe('showFilteredExportDialog', () => {
  beforeEach(() => {
    showDialog.mockReset();
  });

  it('opens a confirmation modal for exports that reuse the current table filters', () => {
    const dialogResult = Promise.resolve({ isConfirmed: true });
    showDialog.mockReturnValue(dialogResult);

    expect(showFilteredExportDialog()).toBe(dialogResult);
    expect(showDialog).toHaveBeenCalledWith({
      title: 'Exportar reporte',
      text: 'Se aplicarán al archivo la búsqueda, los filtros y el orden actuales.',
      popupClass: 'report-export-modal',
      confirmButtonText: 'Descargar'
    });
  });
});
