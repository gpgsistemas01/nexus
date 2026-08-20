import { FULFILLMENT_STATUS_NAMES, GOODS_ISSUE_STATUS_NAMES } from '../../../../constants/fulfillmentStatuses.js';
import { GOODS_RECEIPT_STATUS_LABELS } from '../../../../constants/goodsReceiptStatuses.js';
import {
    buildMdbAdjustStockActionButton,
    buildMdbDeleteActionButton,
    buildMdbEditActionButton,
    buildMdbReturnActionButton,
    buildMdbSupplyActionButton,
    buildMdbViewActionButton
} from '../../../mdb/actionButton.js';

const EDITABLE_ACTION_CONTEXTS = new Set(['person', 'client', 'supplier']);
const SUPPLY_FULFILLMENT_STATUSES = new Set([
    FULFILLMENT_STATUS_NAMES.PENDING,
    FULFILLMENT_STATUS_NAMES.PARTIAL
]);
const ACTION_BUTTONS = Object.freeze({
    view: buildMdbViewActionButton({ className: 'btn-edit', label: 'Ver registro' }),
    edit: buildMdbEditActionButton({ className: 'btn-edit', label: 'Editar registro' }),
    adjustStock: buildMdbAdjustStockActionButton({ className: 'btn-adjust-stock', label: 'Ajustar stock' }),
    deleteMaterial: buildMdbDeleteActionButton({ className: 'btn-delete-material', label: 'Eliminar material' }),
    deleteWaste: buildMdbDeleteActionButton({ className: 'btn-delete-waste', label: 'Eliminar merma' }),
    supplyDetail: buildMdbSupplyActionButton({ className: 'btn-edit-detail', label: 'Surtir detalle' }),
    returnDetail: buildMdbReturnActionButton({ className: 'btn-return-detail', label: 'Devolver material surtido' })
});

const normalizeActionButtonOptions = (options = {}) => typeof options === 'string'
    ? { status: options }
    : options || {};

export const renderActionButtons = (options = {}) => {
    const {
        status,
        fulfillmentStatus,
        context,
        canManage = true,
        canSupply = true,
        canAdjustStock = false,
        canDeleteMaterial = false,
        canDeleteWaste = false
    } = normalizeActionButtonOptions(options);
    const isGoodsIssue = context === 'goodsIssue';
    const isWasteIssue = context === 'wasteIssue';
    const isIssue = isGoodsIssue || isWasteIssue;
    const isGoodsReceipt = context === 'goodsReceipt';
    const isApproved = status === GOODS_ISSUE_STATUS_NAMES.APPROVED;
    const isCanceled = status === GOODS_ISSUE_STATUS_NAMES.CANCELED;
    const isInventoryItem = context === 'material' || context === 'waste';

    return [
        [((isIssue || isGoodsReceipt) && isCanceled), ACTION_BUTTONS.view],
        [canManage && (
            status === GOODS_RECEIPT_STATUS_LABELS.OPEN
            || (isIssue && isApproved)
            || (isGoodsReceipt && !isCanceled)
            || EDITABLE_ACTION_CONTEXTS.has(context)
        ), ACTION_BUTTONS.edit],
        [isInventoryItem && canAdjustStock, ACTION_BUTTONS.adjustStock],
        [context === 'material' && canDeleteMaterial, ACTION_BUTTONS.deleteMaterial],
        [context === 'waste' && canDeleteWaste, ACTION_BUTTONS.deleteWaste],
        [canSupply && isIssue && isApproved && SUPPLY_FULFILLMENT_STATUSES.has(fulfillmentStatus), ACTION_BUTTONS.supplyDetail],
        [canSupply && isIssue && isApproved && fulfillmentStatus === FULFILLMENT_STATUS_NAMES.COMPLETE, ACTION_BUTTONS.returnDetail]
    ]
        .filter(([canRender]) => canRender)
        .map(([, button]) => button)
        .join('');
};
