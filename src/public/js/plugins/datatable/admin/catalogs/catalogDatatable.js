import { getCatalogEntries } from '../../../../application/admin/catalogs/catalogs.js';
import { DOM_EVENT_NAMES } from '../../../../constants/events.js';
import { FORM_MODES } from '../../../../constants/formModes.js';
import { openCatalogModal } from '../../../../pages/admin/catalogs/catalogModal.js';
import { createDataTable } from '../../core/base/createDataTable.js';
import { buildMdbEditActionButton } from '../../../mdb/actionButton.js';
import { getResponsiveRowData } from '../../core/responsive/rowData.js';

const page = document.querySelector('#catalogContext');
const catalog = page.dataset.catalog;
const entityLabel = page.dataset.entityLabel;
const createButtonLabel = page.dataset.createButtonLabel;
const fields = new Set(page.dataset.fields.split(','));
const selector = '#table';

export const createCatalogDatatable = () => {
    const table = createDataTable({
        selector,
        options: {
            ajax: {
                get: params => getCatalogEntries({ ...params, catalog })
            },
            columns: [
                { data: 'name', title: 'Nombre' },
                ...(fields.has('symbol') ? [{ data: 'symbol', title: 'Símbolo' }] : []),
                ...(fields.has('isActive') ? [{
                    data: 'isActive',
                    title: 'Activo',
                    render: value => value ? 'Sí' : 'No'
                }] : []),
                {
                    data: null,
                    title: 'Acciones',
                    render: () => buildMdbEditActionButton({
                        className: 'btn-edit',
                        label: 'Editar registro'
                    })
                }
            ],
            searchPlaceholder: 'Buscar por nombre',
            buttons: [{
                text: createButtonLabel,
                action: () => openCatalogModal({
                    catalog,
                    entityLabel,
                    mode: FORM_MODES.CREATE
                })
            }]
        }
    });

    $(`${ selector } tbody`).on(DOM_EVENT_NAMES.CLICK, '.btn-edit', function () {
        openCatalogModal({
            catalog,
            entityLabel,
            mode: FORM_MODES.EDIT,
            data: getResponsiveRowData(table, this)
        });
    });

    return table;
};
