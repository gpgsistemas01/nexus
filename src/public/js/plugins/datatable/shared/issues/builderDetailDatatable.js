import {
    buildMdbActionButton,
    buildMdbDeleteActionButton,
    buildMdbEditDetailActionButton,
    buildMdbReturnActionButton
} from "../../../mdb/actionButton.js";
import { bindDisabledControlWarning } from "../../../../ui/disabledControlWarning.js";
import { formatCurrency, formatDecimal } from "../../../../utils/formatUtils.js";
import { GOODS_RECEIPT_DETAIL_STATUSES, GOODS_RECEIPT_STATUS_LABELS } from "../../../../constants/goodsReceiptStatuses.js";
import { renderIssueSupplyCheckbox } from "./issueDetailDatatable.js";
import { FORM_MODES } from '../../../../constants/formModes.js';
import { FULFILLMENT_STATUS_NAMES } from '../../../../constants/fulfillmentStatuses.js';

const DISABLED_PROJECT_QUANTITY_MESSAGE = 'Marque el detalle como surtido para capturar la cantidad de proyecto.';

const DISABLED_TABLE_INPUT_SELECTOR = 'input[data-disabled-warning], textarea[data-disabled-warning]';

const buildDetailTableInput = ({ name, value, className, detailId, disabled = false, disabledWarning, min, step }) => `
    <div class="table-input-outline">
        <input
            type="number"
            name="${ name }"
            value="${ value ?? '' }"
            class="form-control ${ className }"
            data-detail-id="${ detailId }"
            ${ disabled ? 'disabled' : '' }
            ${ disabledWarning ? `data-disabled-warning="${ disabledWarning }"` : '' }
            ${ min !== undefined && min !== null ? `min="${ min }"` : '' }
            ${ step !== undefined && step !== null ? `step="${ step }"` : '' }
        >
    </div>
`;

const getElementFromEventPoint = (event) => {

    const point = event.touches?.[0] || event.changedTouches?.[0] || event;

    if (typeof document === 'undefined' || typeof document.elementFromPoint !== 'function') return null;
    if (typeof point.clientX !== 'number' || typeof point.clientY !== 'number') return null;

    return document.elementFromPoint(point.clientX, point.clientY);
};

const resolveDisabledTableInput = (cell, event) => {

    const pointedElement = getElementFromEventPoint(event) || event.target;
    const pointedInput = pointedElement?.closest?.(DISABLED_TABLE_INPUT_SELECTOR);

    if (pointedInput && cell.contains(pointedInput)) return pointedInput;

    return cell.querySelector(`${ DISABLED_TABLE_INPUT_SELECTOR }:disabled:hover`);
};


const shouldShowReceiptPurchaseColumns = ({ type }) => type === 'receipt';

const RECEIPT_DETAIL_ACTION_MODES = [FORM_MODES.EDIT];

const shouldShowIssueSuppliedQuantity = ({ type, mode }) => (
    type === 'issue'
    && [FORM_MODES.EDIT_DETAIL, FORM_MODES.RETURN].includes(mode)
);

const shouldShowIssueReturnedQuantity = ({ type, mode }) => (
    type === 'issue'
    && mode === FORM_MODES.RETURN
);

const shouldShowIssueProjectColumns = ({ type, mode, canManageProjectQuantity }) => (
    type === 'issue'
    && canManageProjectQuantity
    && mode === FORM_MODES.EDIT_DETAIL
);

const shouldShowActionsColumn = ({ type, mode }) => {
    if (type === 'receipt') return mode === FORM_MODES.CREATE;

    return ![
        FORM_MODES.EDIT_DETAIL,
        FORM_MODES.EDIT_HEADER,
        FORM_MODES.RETURN,
        FORM_MODES.VIEW
    ].includes(mode);
};


const shouldShowIssueReturnActions = ({ type, mode }) => type === 'issue' && mode === FORM_MODES.RETURN;

const shouldShowReceiptDetailActions = ({ type, mode }) => (
    type === 'receipt'
    && RECEIPT_DETAIL_ACTION_MODES.includes(mode)
);

const shouldShowDetailActionsHeader = ({ type, mode }) => (
    shouldShowIssueReturnActions({ type, mode })
    || shouldShowReceiptDetailActions({ type, mode })
    || shouldShowActionsColumn({ type, mode })
);

const isCanceledDetail = (row = {}) => {
    const statusName = row.fulfillmentStatus?.name || row.status?.name || row.status;

    return Boolean(
        row.isCanceled
        || row.isCancelled
        || row.canceledAt
        || row.cancelledAt
        || statusName === FULFILLMENT_STATUS_NAMES.CANCELED
        || statusName === GOODS_RECEIPT_STATUS_LABELS.CANCELED
    );
};

const shouldShowDetailActionButtons = ({ row, mode }) => {
    if (mode === FORM_MODES.CREATE) return true;

    return Boolean(row?.id) && !isCanceledDetail(row);
};

const resolveIssueSuppliedQuantityForDisplay = (row = {}) => {
    if (isCanceledDetail(row)) return row.returnedQuantity;

    return row.suppliedQuantity;
};

export const buildDetailsHeader = ({ type, mode, canManageProjectQuantity = false }) => {

    let extraHeaders = '';
    const suppliedQuantityHeader = shouldShowIssueSuppliedQuantity({ type, mode })
        ? '<th rowspan="2">Cantidad surtida</th>'
        : '';
    const returnedQuantityHeader = shouldShowIssueReturnedQuantity({ type, mode })
        ? '<th rowspan="2">Cantidad devuelta</th>'
        : '';
    const transactionQuantityHeader = `<th rowspan="2">${ type === 'issue' ? 'Salida' : 'Compra' }</th>`;

    if (shouldShowIssueProjectColumns({ type, mode, canManageProjectQuantity })) {
        extraHeaders += `
            <th rowspan="2">Costo unitario de Conversión</th>
            <th rowspan="2">Cantidad de proyecto</th>
            <th rowspan="2">Diferencia</th>
        `;
    }

    if (shouldShowReceiptPurchaseColumns({ type, mode })) {
        extraHeaders += `
            <th rowspan="2">Costo Unitario de Conversión</th>
            <th rowspan="2">Costo por Presentación</th>
            <th rowspan="2">Monto s/ IVA</th>
            <th rowspan="2">Monto c/ IVA</th>
        `;
    }

    if (type === 'issue' && mode === FORM_MODES.EDIT_DETAIL) {
        extraHeaders += `<th rowspan="2">Surtir</th>`;
    }

    if (shouldShowDetailActionsHeader({ type, mode })) {
        extraHeaders += `<th rowspan="2">Acciones</th>`;
    }

    return `
        <thead>
            <tr>
                <th rowspan="2">Material</th>
                <th colspan="2">Medidas</th>
                ${ transactionQuantityHeader }
                ${ suppliedQuantityHeader }
                ${ returnedQuantityHeader }
                <th rowspan="2">Presentación</th>
                <th colspan="2">Conversión</th>
                ${ extraHeaders }
            </tr>
            <tr>
                <th>Base</th>
                <th>Altura</th>
                <th>Cantidad</th>
                <th>Unidad</th>
            </tr>
        </thead>
    `;
};

export const buildDetailsColumns = ({ type, mode, canManageProjectQuantity = false }) => {

    bindDisabledControlWarning({
        eventTargetSelector: '#materialTable td',
        eventNamespace: 'materialTableDisabledInputWarning',
        resolveControl: resolveDisabledTableInput
    });

    const columns = [
        {
            data: 'name'
        },
        {
            data: row => row.base ?? null,
            render: formatDecimal
        },
        {
            data: row => row.height ?? null,
            render: formatDecimal
        },
        { data: 'quantity', render: formatDecimal },
        ...(shouldShowIssueSuppliedQuantity({ type, mode }) ? [
            {
                data: null,
                render: (_, __, row) => formatDecimal(resolveIssueSuppliedQuantityForDisplay(row))
            }
        ] : []),
        ...(shouldShowIssueReturnedQuantity({ type, mode }) ? [
            { data: 'returnedQuantity', render: formatDecimal }
        ] : []),
        {
            data: row => row.presentation ?? ''
        },
        { data: 'convertedQuantity', render: formatDecimal },
        {
            data: row => row.unitMeasure ?? ''
        },
    ];

    if (shouldShowIssueProjectColumns({ type, mode, canManageProjectQuantity })) {
        columns.push(
            { data: 'maxUnitCost', render: formatCurrency },
            {
                data: 'projectConvertedQuantity',
                render: (value, _, row) => {

                    const detailId = row.id;
                    const isEditableDetail = mode === FORM_MODES.EDIT_DETAIL && !row.originalIsSupplied;
                    const isProjectQuantityDisabled = !isEditableDetail || !row.isSupplied;

                    return `
                        ${ buildDetailTableInput({
                            name: 'projectConvertedQuantity',
                            value,
                            className: 'project-converted-quantity-input',
                            detailId,
                            disabled: isProjectQuantityDisabled,
                            disabledWarning: DISABLED_PROJECT_QUANTITY_MESSAGE,
                            min: '0'
                        }) }
                        <div data-error-for="projectConvertedQuantity-${ detailId }" class="invalid-feedback d-none"></div>
                    `;
                }
            },
            { data: 'convertedQuantityDifference', render: formatDecimal }
        );
    }

    if (shouldShowReceiptPurchaseColumns({ type, mode })) {
        columns.push(
            { data: 'conversionUnitCost', render: formatCurrency },
            { data: 'costPerUnitType', render: formatCurrency },
            { data: 'netPurchaseAmount', render: formatCurrency },
            { data: 'grossPurchaseAmount', render: formatCurrency }
        );
    }


    if (type === 'issue' && mode === FORM_MODES.EDIT_DETAIL) {
        columns.push({
            data: null,
            // El surtido es la acción principal de este modo. Se conserva antes
            // que las columnas informativas cuando Responsive reduce la tabla.
            responsivePriority: 1,
            render: (_, __, row) => {

                const detailId = row.id;
                const isEditableDetail = mode === FORM_MODES.EDIT_DETAIL && !row.originalIsSupplied;

                return renderIssueSupplyCheckbox({
                    detailId,
                    isSupplied: row.isSupplied,
                    isDisabled: !isEditableDetail
                });
            }
        });
    }


    if (shouldShowIssueReturnActions({ type, mode })) {
        columns.push({
            data: null,
            orderable: false,
            searchable: false,
            render: (_, __, row) => {
                const suppliedQuantity = Number(row.suppliedQuantity ?? 0);
                const returnedQuantity = Number(row.returnedQuantity ?? 0);
                const returnableQuantity = suppliedQuantity - returnedQuantity;

                if (!row.id || returnableQuantity <= 0) return '';

                return `${ buildMdbReturnActionButton({
                    className: 'return-issue-detail-btn',
                    label: 'Devolver detalle de salida',
                    htmlAttrs: {
                        'data-id': row.id,
                        'data-returnable-quantity': returnableQuantity
                    }
                }) }`;
            }
        });
    }

    if (shouldShowReceiptDetailActions({ type, mode })) {
        columns.push({
            data: null,
            title: 'Acciones',
            orderable: false,
            searchable: false,
            render: (_, __, row) => {
                const detailId = row.id;
                const isCanceledDetail = row.status === GOODS_RECEIPT_DETAIL_STATUSES.CANCELED;
                const isCanceledReceipt = row.goodsReceiptStatusName === GOODS_RECEIPT_STATUS_LABELS.CANCELED;
                const canManageDetail = Boolean(detailId) && !isCanceledDetail && !isCanceledReceipt;

                if (!canManageDetail) return '';

                return `
                    ${ buildMdbEditDetailActionButton({
                        className: 'correct-detail-btn',
                        label: 'Corregir detalle de compra',
                        htmlAttrs: {
                            'data-id': detailId
                        }
                    }) }
                    ${ buildMdbActionButton({
                        className: 'cancel-receipt-detail-btn',
                        colorClass: 'btn-danger',
                        iconClass: 'fa-solid fa-ban',
                        label: 'Cancelar detalle de compra',
                        htmlAttrs: {
                            'data-id': detailId
                        }
                    }) }
                `;
            }
        });
    }

    if (shouldShowActionsColumn({ type, mode })) {
        columns.push({
            data: null,
            render: (_, __, row) => {
                if (!shouldShowDetailActionButtons({ row, mode })) return '';

                const isSuppliedDetail = type === 'issue' && row.isSupplied;

                return buildMdbDeleteActionButton({
                    className: 'delete-btn',
                    label: isSuppliedDetail ? 'El detalle ya fue surtido' : 'Eliminar detalle',
                    htmlAttrs: {
                        'data-id': row.id,
                        disabled: isSuppliedDetail
                    }
                });
            }
        });
    }

    return columns;
};
