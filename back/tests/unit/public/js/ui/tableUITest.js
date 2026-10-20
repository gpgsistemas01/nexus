import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../../../src/public/js/plugins/swal/swalComponent.js', () => ({
  notifications: { showModal: vi.fn(), showError: vi.fn(), showSuccess: vi.fn() }
}));
vi.mock('../../../../../src/public/js/ui/reportExportDialog.js', () => ({
  showFilteredExportDialog: vi.fn().mockResolvedValue({ isConfirmed: true }),
  showInventoryExportDialog: vi.fn(),
  showReportExportDialog: vi.fn()
}));
vi.mock('../../../../../src/public/js/plugins/datatable/core/base/tableOperations.js', () => ({ reloadMainTable: vi.fn() }));
vi.mock('../../../../../src/public/js/ui/modalUI.js', () => ({ closeModal: vi.fn() }));

const { notifications } = await import('../../../../../src/public/js/plugins/swal/swalComponent.js');
const { buildExcelButton } = await import('../../../../../src/public/js/ui/tableUI.js');
const { handleAction } = await import('../../../../../src/public/js/ui/forms/formUI.js');
const { reloadMainTable } = await import('../../../../../src/public/js/plugins/datatable/core/base/tableOperations.js');
const { closeModal } = await import('../../../../../src/public/js/ui/modalUI.js');

describe('errores compartidos en descargas y acciones sin captura', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.unstubAllGlobals());

  it('muestra el código del fallo de exportación en Swal sin intentar descargar un archivo parcial', async () => {
    const createObjectURL = vi.fn();
    vi.stubGlobal('window', { URL: { createObjectURL } });
    const request = vi.fn().mockRejectedValue({ status: 503, data: { code: 'DATABASE_TABLE_MISSING' } });

    await buildExcelButton({ request, allowMonthlyReport: false }).action();

    expect(request).toHaveBeenCalledTimes(1);
    expect(createObjectURL).not.toHaveBeenCalled();
    expect(notifications.showModal).toHaveBeenCalledExactlyOnceWith({
      title: 'No se pudo completar la acción',
      text: 'Falta una tabla requerida en la base de datos. Contacta a soporte. (Código: DATABASE_TABLE_MISSING)',
      icon: 'error'
    });
    expect(notifications.showError).not.toHaveBeenCalled();
  });

  it('una eliminación rechazada conserva el formulario y el mismo aviso de recurso inexistente', async () => {
    const form = { dataset: { id: 'record' } };
    vi.stubGlobal('document', { querySelector: () => form });
    const action = vi.fn().mockRejectedValue({ status: 404, data: { code: 'WASTE_NOT_FOUND' } });

    await handleAction({ action, formId: '#form' });

    expect(action).toHaveBeenCalledExactlyOnceWith('record');
    expect(notifications.showModal).toHaveBeenCalledExactlyOnceWith({ title: 'La merma no existe.', text: null, icon: 'warning' });
    expect(notifications.showSuccess).not.toHaveBeenCalled();
    expect(closeModal).not.toHaveBeenCalled();
    expect(reloadMainTable).not.toHaveBeenCalled();
  });
});
