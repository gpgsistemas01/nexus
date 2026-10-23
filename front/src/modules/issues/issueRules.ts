import { roundTo } from '@nexus/numbers';
import { FULFILLMENT_STATUS_NAMES, GOODS_ISSUE_STATUS_NAMES } from '@nexus/issue-statuses';
import type { IssueRow, IssueDetail, IssueTarget, IssueWriteTarget } from './issue.js';

export const canEditIssue = (row: IssueRow) =>
    row.status === GOODS_ISSUE_STATUS_NAMES.APPROVED &&
    row.fulfillmentStatus !== FULFILLMENT_STATUS_NAMES.CANCELED;

export const resolveIssueEditMode = (row: IssueRow): 'view' | 'edit' | 'header' =>
    !canEditIssue(row)
        ? 'view'
        : row.fulfillmentStatus === FULFILLMENT_STATUS_NAMES.PENDING
          ? 'edit'
          : 'header';

export const canSupplyIssue = (row: IssueRow) =>
    canEditIssue(row) &&
    (row.fulfillmentStatus === FULFILLMENT_STATUS_NAMES.PENDING ||
        row.fulfillmentStatus === FULFILLMENT_STATUS_NAMES.PARTIAL);

export const canReturnIssue = (row: IssueRow) =>
    canEditIssue(row) && row.fulfillmentStatus === FULFILLMENT_STATUS_NAMES.COMPLETE;

export const getIssueReturnableQuantity = (row: IssueDetail) =>
    roundTo(row.suppliedQuantity - row.returnedQuantity);

export const isIssueWriteTarget = (target: IssueTarget): target is IssueWriteTarget =>
    target.mode === 'create' ||
    target.mode === 'edit' ||
    target.mode === 'header' ||
    target.mode === 'supply';
