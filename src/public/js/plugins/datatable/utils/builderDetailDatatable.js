import { buildMdbActionButton } from "../../mdb/actionButton.js";
import { bindDisabledControlWarning } from "../../../ui/disabledControlWarning.js";

const DISABLED_PROJECT_QUANTITY_MESSAGE = 'Marque el detalle como surtido para capturar la cantidad de proyecto.';
const DISABLED_RETURN_QUANTITY_MESSAGE = 'Marque el detalle para devolución antes de capturar la cantidad devuelta.';

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

const isReturnMode = (mode) => mode === 'return';

const shouldShowTransactionQuantity = (mode) => !isReturnMode(mode);

const shouldShowReceiptPurchaseColumns = ({ type, mode }) => type === 'receipt' && !isReturnMode(mode);

const shouldShowIssueProjectColumns = ({ type, mode, isWarehouse, isCoordinator, isSystem }) => (
    type === 'issue'
    && ((isWarehouse && isCoordinator) || isSystem)
    && (mode === 'edit-detail' || mode === 'view')
);

const shouldShowActionsColumn = ({ type, mode }) => {
    if (type === 'receipt') return mode === 'create';

    return !['view', 'edit-detail', 'return'].includes(mode);
};

export const buildDetailsHeader = ({ type, mode, isWarehouse, isCoordinator, isSystem }) => {

    let extraHeaders = '';
    const showReturnColumns = (type === 'issue' || type === 'receipt') && isReturnMode(mode);
    const suppliedQuantityHeader = type === 'issue' && (mode === 'edit-detail' || mode === 'view')
        ? '<th rowspan="2">Cantidad surtida</th>'
        : '';
    const transactionQuantityHeader = shouldShowTransactionQuantity(mode)
        ? `<th rowspan="2">${ type === 'issue' ? 'Salida' : 'Compra' }</th>`
        : '';
    const availableReturnQuantityHeader = showReturnColumns
        ? '<th rowspan="2">Disponible para devolver</th>'
        : '';

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

    if (showReturnColumns) {
        extraHeaders += `
            <th rowspan="2">Total devuelto</th>
            <th rowspan="2">Cantidad devuelta registrada</th>
            <th rowspan="2">Devolver</th>
        `;
    }

    if (type === 'receipt' && ['edit', 'view'].includes(mode)) {
        extraHeaders += `<th rowspan="2">Acciones</th>`;
    }

    if (shouldShowActionsColumn({ type, mode })) {
        extraHeaders += `<th rowspan="2">Acciones</th>`;
    }

    return `
        <thead>
            <tr>
                <th rowspan="2">Material</th>
                <th colspan="2">Medidas</th>
                ${ transactionQuantityHeader }
                ${ suppliedQuantityHeader }
                ${ availableReturnQuantityHeader }
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

    const showReturnColumns = (type === 'issue' || type === 'receipt') && isReturnMode(mode);
    const columns = [
        {
            data: null,
            render
        },
        { data: 'productBase' },
        { data: 'productHeight' },
        ...(shouldShowTransactionQuantity(mode) ? [{ data: 'quantity' }] : []),
        ...(type === 'issue' && (mode === 'edit-detail' || mode === 'view') ? [{ data: 'suppliedQuantity' }] : []),
        ...(showReturnColumns ? [{ data: 'availableReturnQuantity', defaultContent: 0 }] : []),
        { data: 'presentationName' },
        { data: 'convertedQuantity' },
        { data: 'unitMeasureName' },
    ];

    if (shouldShowIssueProjectColumns({ type, mode, isWarehouse, isCoordinator, isSystem })) {
        columns.push(
            { data: 'maxUnitCost' },
            {
                data: 'projectConvertedQuantity',
                render: (value, _, row) => {

                    if (mode === 'view') return value ?? '';

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
            { data: 'convertedQuantityDifference' }
        );
    }

    if (shouldShowReceiptPurchaseColumns({ type, mode })) {
        columns.push(
            { data: 'conversionUnitCost' },
            { data: 'costPerUnitType' },
            { data: 'netPurchaseAmount' },
            { data: 'grossPurchaseAmount' }
        );
    }

    if (showReturnColumns) {
        columns.push(
            { data: 'returnedQuantityTotal', defaultContent: 0 },
            {
                data: 'returnedQuantity',
                render: (value, _, row) => {
                    const detailId = row.id || row.productId;
                    return `
                        ${ buildDetailTableInput({
                            name: 'returnedQuantity',
                            value,
                            className: 'return-quantity-input',
                            detailId,
                            disabled: !row.isReturned,
                            disabledWarning: DISABLED_RETURN_QUANTITY_MESSAGE,
                            min: '0.01',
                            step: '0.01'
                        }) }
                        <div data-error-for="returnedQuantity-${ detailId }" class="invalid-feedback d-none"></div>
                    `;
                }
            },
            {
                data: null,
                render: (_, __, row) => {
                    const detailId = row.id || row.productId;
                    return `
                        <input type="checkbox"
                            name="isReturned"
                            class="form-check-input return-checkbox"
                            data-detail-id="${ detailId }"
                            ${ row.isReturned ? 'checked' : '' }
                        >
                    `;
                }
            }
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

    if (type === 'receipt' && ['edit', 'view'].includes(mode)) {
        columns.push({
            data: null,
            title: 'Acciones',
            orderable: false,
            searchable: false,
            render: (_, __, row) => buildMdbActionButton({
                className: 'correct-detail-btn',
                colorClass: 'btn-info',
                iconClass: 'fa-solid fa-pen-to-square',
                title: 'Corregir detalle',
                ariaLabel: 'Corregir detalle de compra',
                htmlAttrs: {
                    'data-id': row.id
                }
            })
        });
    }

    if (shouldShowActionsColumn({ type, mode })) {
        columns.push({
            data: null,
            render: (_, __, row) => {
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
