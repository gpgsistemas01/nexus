import { FORM_MODES } from '../../../../../constants/formModes.js';
import {
    shouldShowDetailActionsHeader,
    shouldShowIssueProjectColumns,
    shouldShowIssueReturnedQuantity,
    shouldShowIssueSuppliedQuantity,
    shouldShowReceiptPurchaseColumns
} from './detailRules.js';

export const buildDetailsHeader = ({
    type,
    mode,
    canManageProjectQuantity = false,
    itemLabel = 'Material'
}) => {
    const context = { type, mode, canManageProjectQuantity };
    let extraHeaders = '';
    const suppliedQuantityHeader = shouldShowIssueSuppliedQuantity(context) ? '<th rowspan="2">Cantidad surtida</th>' : '';
    const returnedQuantityHeader = shouldShowIssueReturnedQuantity(context) ? '<th rowspan="2">Cantidad devuelta</th>' : '';
    const transactionQuantityHeader = `<th rowspan="2">${ type === 'issue' ? 'Salida' : 'Compra' }</th>`;

    if (shouldShowIssueProjectColumns(context)) {
        extraHeaders += `
            <th rowspan="2">Costo unitario de Conversión</th>
            <th rowspan="2">Cantidad de proyecto</th>
            <th rowspan="2">Diferencia</th>
        `;
    }
    if (shouldShowReceiptPurchaseColumns(context)) {
        extraHeaders += `
            <th rowspan="2">Costo Unitario de Conversión</th>
            <th rowspan="2">Costo por Presentación</th>
            <th rowspan="2">Monto s/ IVA</th>
            <th rowspan="2">Monto c/ IVA</th>
        `;
    }
    if (type === 'issue' && mode === FORM_MODES.EDIT_DETAIL) extraHeaders += '<th rowspan="2">Surtir</th>';
    if (shouldShowDetailActionsHeader(context)) extraHeaders += '<th rowspan="2">Acciones</th>';

    return `
        <thead>
            <tr>
                <th rowspan="2">${ itemLabel }</th>
                <th colspan="2">Medidas</th>
                ${ transactionQuantityHeader }
                ${ suppliedQuantityHeader }
                ${ returnedQuantityHeader }
                <th rowspan="2">Presentación</th>
                <th colspan="2">Conversión</th>
                ${ extraHeaders }
            </tr>
            <tr><th>Base</th><th>Altura</th><th>Cantidad</th><th>Unidad</th></tr>
        </thead>
    `;
};
