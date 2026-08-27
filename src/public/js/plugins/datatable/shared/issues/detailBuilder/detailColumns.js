import { FORM_MODES } from '../../../../../constants/formModes.js';
import { GOODS_RECEIPT_DETAIL_STATUSES, GOODS_RECEIPT_STATUS_LABELS } from '../../../../../constants/goodsReceiptStatuses.js';
import {
    buildMdbActionButton,
    buildMdbDeleteActionButton,
    buildMdbEditDetailActionButton,
    buildMdbReturnActionButton
} from '../../../../mdb/actionButton.js';
import { formatCurrency, formatDecimal } from '../../../../../utils/formatUtils.js';
import { renderIssueSupplyCheckbox } from '../issueDetailDatatable.js';
import {
    bindDetailInputWarnings,
    buildDetailTableInput,
    DISABLED_PROJECT_QUANTITY_MESSAGE
} from './detailInputs.js';
import {
    shouldShowActionsColumn,
    shouldShowDetailActionButtons,
    shouldShowIssueProjectColumns,
    shouldShowIssueReturnActions,
    shouldShowIssueReturnedQuantity,
    shouldShowIssueSuppliedQuantity,
    shouldShowReceiptDetailActions,
    shouldShowReceiptPurchaseColumns,
    resolveDetailActionIdentifier,
    resolveIssueSuppliedQuantityForDisplay
} from './detailRules.js';

const DETAIL_CONTROL_RESPONSIVE_PRIORITY = 1;

export const buildDetailsColumns = ({ type, mode, canManageProjectQuantity = false }) => {

    bindDetailInputWarnings();

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
                title: 'Cantidad de proyecto',
                responsivePriority: DETAIL_CONTROL_RESPONSIVE_PRIORITY,
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
            title: 'Surtir',
            responsivePriority: DETAIL_CONTROL_RESPONSIVE_PRIORITY,
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
            responsivePriority: DETAIL_CONTROL_RESPONSIVE_PRIORITY,
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
            responsivePriority: DETAIL_CONTROL_RESPONSIVE_PRIORITY,
            ...(type === 'receipt' && {
                title: 'Acciones'
            }),
            render: (_, __, row) => {
                if (!shouldShowDetailActionButtons({ row, mode })) return '';

                const isSuppliedDetail = type === 'issue' && row.isSupplied;

                return buildMdbDeleteActionButton({
                    className: 'delete-btn',
                    label: isSuppliedDetail ? 'El detalle ya fue surtido' : 'Eliminar detalle',
                    htmlAttrs: {
                        'data-id': resolveDetailActionIdentifier(row),
                        disabled: isSuppliedDetail
                    }
                });
            }
        });
    }

    return columns;
};
