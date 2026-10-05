import { handleApiError } from '../../../../api/errorHandler.js';
import { DOM_EVENT_NAMES } from '../../../../constants/events.js';
import { FORM_MODES } from '../../../../constants/formModes.js';
import { DATATABLE_SELECTORS } from '../../../../constants/selectors.js';
import { openMaterialModal } from '../../../../pages/warehouse/materials/materialModal.js';
import { notifications } from '../../../swal/swalComponent.js';
import { getResponsiveRowData } from '../../core/responsive/rowData.js';
import { mapMaterialRowToFormData } from '../../warehouse/materials/materialRow.js';

export const bindMaterialInventoryActions = ({
    table,
    resource,
    remove,
    deleteConfirmation,
    deleteSuccessMessage
}) => {
    const tableBodySelector = `${ DATATABLE_SELECTORS.MAIN } tbody`;

    $(`${ tableBodySelector }`).on(DOM_EVENT_NAMES.CLICK, '.btn-edit', function () {
        const data = getResponsiveRowData(table, this);

        openMaterialModal({
            mode: FORM_MODES.EDIT,
            data: mapMaterialRowToFormData(data),
            resource
        });
    });

    $(`${ tableBodySelector }`).on(DOM_EVENT_NAMES.CLICK, '.btn-adjust-stock', function () {
        const data = getResponsiveRowData(table, this);

        openMaterialModal({
            mode: FORM_MODES.EDIT_STOCK,
            data: mapMaterialRowToFormData(data),
            resource
        });
    });

    $(`${ tableBodySelector }`).on(DOM_EVENT_NAMES.CLICK, '.btn-delete-material', async function () {
        const data = getResponsiveRowData(table, this);
        const result = await notifications.showConfirmation({
            ...deleteConfirmation,
            icon: 'warning',
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
            variant: 'danger'
        });

        if (!result.isConfirmed) return;

        try {
            const response = await remove({ id: data.id });

            notifications.showSuccess(response.message || deleteSuccessMessage);
            table.ajax.reload(null, false);
        } catch (err) {
            handleApiError({ err, rethrow: false });
        }
    });
};
