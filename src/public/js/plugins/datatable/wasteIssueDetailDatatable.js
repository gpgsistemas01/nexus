import { FORM_MODES } from '../../constants/formModes.js';
import { formatDecimal } from '../../utils/formatUtils.js';
import { formatIssueItemDimensions } from '../../utils/warehouse/issueDisplayUtils.js';
import { buildMdbActionButton } from '../mdb/actionButton.js';
import { createIssueDetailDatatable, renderIssueSupplyCheckbox } from './issueDetailDatatable.js';

const buildColumns = mode => [
    { title: 'Merma', data: 'materialName' },
    { title: 'Proveedor', data: 'supplierName' },
    { title: 'Dimensiones', data: null, render: (_, __, detail) => formatIssueItemDimensions(detail) },
    { title: 'Cantidad', data: 'quantity', render: formatDecimal },
    { title: 'Presentación', data: 'presentationName' },
    { title: 'Unidad', data: 'unitMeasureSymbol' },
    ...(mode === FORM_MODES.EDIT_DETAIL ? [
        { title: 'Cantidad surtida', data: 'suppliedQuantity', render: formatDecimal },
        {
            title: 'Surtir',
            data: null,
            render: (_, __, detail) => renderIssueSupplyCheckbox({
                detailId: detail.id,
                isSupplied: detail.isSupplied,
                isDisabled: detail.originalIsSupplied
            })
        }
    ] : mode === FORM_MODES.RETURN ? [
        { title: 'Devuelto', data: 'returnedQuantity', render: formatDecimal },
        {
            title: 'Acciones',
            data: null,
            render: (_, __, detail) => {
                const available = Number(detail.suppliedQuantity) - Number(detail.returnedQuantity);

                return available > 0 ? buildMdbActionButton({
                    className: 'js-return-detail',
                    colorClass: 'btn-warning',
                    iconClass: 'fa-solid fa-rotate-left',
                    label: 'Devolver detalle',
                    htmlAttrs: { 'data-id': detail.id }
                }) : '';
            }
        }
    ] : [{
        title: 'Acciones',
        data: null,
        render: (_, __, detail) => `<button class="btn btn-sm btn-danger js-remove" type="button" data-id="${ detail.wasteId }" aria-label="Quitar"><i class="fas fa-trash-alt"></i></button>`
    }])
];

export const renderWasteIssueDetails = ({ data, mode }) => createIssueDetailDatatable({
    selector: '#wasteIssueDraftTable',
    data,
    columns: buildColumns(mode),
    options: { paging: false, searching: false, info: false, dom: 't' }
});
