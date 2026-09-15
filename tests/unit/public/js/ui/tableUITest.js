import { beforeEach, describe, expect, it, vi } from 'vitest';

const showFilteredExportDialog = vi.fn();
const showInventoryExportDialog = vi.fn();
const showReportExportDialog = vi.fn();

vi.mock('../../../../../src/public/js/ui/reportExportDialog.js', () => ({
  showFilteredExportDialog,
  showInventoryExportDialog,
  showReportExportDialog
}));

vi.mock('../../../../../src/public/js/plugins/swal/swalComponent.js', () => ({
  notifications: { showError: vi.fn() }
}));

vi.mock('../../../../../src/public/js/utils/timeZone.js', () => ({
  getTimeZoneDateTimeParts: () => ({ year: 2026, month: 9 })
}));

const { buildExcelButton } = await import('../../../../../src/public/js/ui/tableUI.js');

describe('buildExcelButton', () => {
  beforeEach(() => {
    showFilteredExportDialog.mockReset();
    showInventoryExportDialog.mockReset();
    showReportExportDialog.mockReset();
  });

  it('opens the filtered export modal before a non-monthly export', async () => {
    const request = vi.fn();
    showFilteredExportDialog.mockResolvedValue({ isConfirmed: false });

    await buildExcelButton({ request, allowMonthlyReport: false }).action();

    expect(showFilteredExportDialog).toHaveBeenCalledOnce();
    expect(request).not.toHaveBeenCalled();
  });
});
