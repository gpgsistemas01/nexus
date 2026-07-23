import { buildMdbActionButton } from "../../mdb/actionButton.js";
import { bindDisabledControlWarning } from "../../../ui/disabledControlWarning.js";
import { formatCurrency, formatDecimal } from "../../../utils/formatUtils.js";

const DISABLED_PROJECT_QUANTITY_MESSAGE = 'Marque el detalle como surtido para capturar la cantidad de proyecto.';
const GOODS_RECEIPT_DETAIL_STATUS = Object.freeze({
    CANCELED: 'CANCELED'
});
const GOODS_RECEIPT_STATUS_LABELS = Object.freeze({
    CANCELED: 'Cancelada'
});

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

const ISSUE_DETAIL_RETURN_MODES = ['edit-detail', 'return'];
const RECEIPT_DETAIL_ACTION_MODES = ['edit'];

const shouldShowIssueProjectColumns = ({ type, mode, isWarehouse, isCoordinator, isSystem }) => (
    type === 'issue'
    && ((isWarehouse && isCoordinator) || isSystem)
    && mode === 'edit-detail'
);

const shouldShowActionsColumn = ({ type, mode }) => {
    if (type === 'receipt') return mode === 'create';

    return !['edit-detail', 'edit-header', 'return'].includes(mode);
};


const shouldShowIssueReturnActions = ({ type, mode }) => type === 'issue' && mode === 'return';

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
        || statusName === 'Cancelado'
        || statusName === 'Cancelada'
    );
};

const shouldShowDetailActionButtons = ({ row, mode }) => {
    if (mode === 'create') return true;

    return Boolean(row?.id) && !isCanceledDetail(row);
};

export const buildDetailsHeader = ({ type, mode, isWarehouse, isCoordinator, isSystem }) => {

    let extraHeaders = '';
    const issueReturnHeaders = type === 'issue' && ISSUE_DETAIL_RETURN_MODES.includes(mode)
        ? '<th rowspan="2">Cantidad surtida</th><th rowspan="2">Cantidad devuelta</th>'
        : '';
    const transactionQuantityHeader = `<th rowspan="2">${ type === 'issue' ? 'Salida' : 'Compra' }</th>`;

    if (shouldShowIssueProjectColumns({ type, mode, isWarehouse, isCoordinator, isSystem })) {
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

    if (type === 'issue' && mode === 'edit-detail') {
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
                ${ issueReturnHeaders }
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

export const buildDetailsColumns = ({ type, mode, render, isWarehouse, isCoordinator, isSystem }) => {

    bindDisabledControlWarning({
        eventTargetSelector: '#productTable td',
        eventNamespace: 'productTableDisabledInputWarning',
        resolveControl: resolveDisabledTableInput
    });

    const columns = [
        {
            data: null,
            render
        },
        { data: 'productBase', render: formatDecimal },
        { data: 'productHeight', render: formatDecimal },
        { data: 'quantity', render: formatDecimal },
        ...(type === 'issue' && ISSUE_DETAIL_RETURN_MODES.includes(mode) ? [
            { data: 'suppliedQuantity', render: formatDecimal },
            { data: 'returnedQuantity', render: formatDecimal }
        ] : []),
        { data: 'presentationName' },
        { data: 'convertedQuantity', render: formatDecimal },
        { data: 'unitMeasureName' },
    ];

    if (shouldShowIssueProjectColumns({ type, mode, isWarehouse, isCoordinator, isSystem })) {
        columns.push(
            { data: 'maxUnitCost', render: formatCurrency },
            {
                data: 'projectConvertedQuantity',
                render: (value, _, row) => {

                    const detailId = row.id || row.productId;
                    const isEditableDetail = mode === 'edit-detail' && !row.originalIsSupplied;
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


    if (type === 'issue' && mode === 'edit-detail') {
        columns.push({
            data: null,
            render: (_, __, row) => {
                
                const detailId = row.id || row.productId;
                const isEditableDetail = mode === 'edit-detail' && !row.originalIsSupplied;

                return `
                    <input type="checkbox"
                        name="isSupplied"
                        class="form-check-input supply-checkbox"
                        data-detail-id="${ detailId }"
                        ${ row.isSupplied ? 'checked' : '' }
                        ${ isEditableDetail ? '' : 'disabled' }
                    >
                `;
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

                return `${ buildMdbActionButton({
                    className: 'return-issue-detail-btn',
                    colorClass: 'btn-warning',
                    iconClass: 'fa-solid fa-rotate-left',
                    title: 'Devolver detalle',
                    ariaLabel: 'Devolver detalle de salida',
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
                const isCanceledDetail = row.status === GOODS_RECEIPT_DETAIL_STATUS.CANCELED;
                const isCanceledReceipt = row.goodsReceiptStatusName === GOODS_RECEIPT_STATUS_LABELS.CANCELED;
                const canManageDetail = Boolean(detailId) && !isCanceledDetail && !isCanceledReceipt;

                if (!canManageDetail) return '';

                return `
                    ${ buildMdbActionButton({
                        className: 'correct-detail-btn',
                        colorClass: 'btn-info',
                        iconClass: 'fa-solid fa-pen-to-square',
                        title: 'Corregir detalle',
                        ariaLabel: 'Corregir detalle de compra',
                        htmlAttrs: {
                            'data-id': detailId
                        }
                    }) }
                    ${ buildMdbActionButton({
                        className: 'cancel-receipt-detail-btn',
                        colorClass: 'btn-danger',
                        iconClass: 'fa-solid fa-ban',
                        title: 'Cancelar detalle',
                        ariaLabel: 'Cancelar detalle de compra',
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

                return `
                    <button
                        type="button"
                        class="btn btn-danger btn-sm delete-btn"
                        data-id="${ row.productId }"
                        ${ isSuppliedDetail ? 'disabled title="El detalle ya fue surtido"' : '' }
                    >
                        <i class="fas fa-trash-alt"></i>
                    </button>
                `;
            }
        });
    }

    return columns;
};
