import type { LookupItem, LookupState } from '../../shared/lookup.js';
import type { RecordQuery } from '../../shared/list.js';

export type IssueResource = 'materials' | 'consumables' | 'wastes';
export type IssueMode = 'create' | 'edit' | 'header' | 'view' | 'supply' | 'return';
export interface IssueRow {
    id: string;
    referenceNumber: string;
    requestDate: string;
    requesterId: string;
    requesterName: string;
    advisorId: string;
    advisorName: string;
    clientId: string;
    clientName: string;
    departmentId: string;
    departmentName: string;
    projectNumber: string;
    observations: string;
    status: string;
    fulfillmentStatus: string;
}
export interface IssueDetail {
    id: string;
    itemId: string;
    supplierId: string;
    name: string;
    base: number | null;
    height: number | null;
    presentation: string;
    unitMeasure: string;
    quantity: number;
    convertedQuantity: number;
    suppliedQuantity: number;
    returnedQuantity: number;
    maxUnitCost: number | null;
    projectConvertedQuantity: string;
    isSupplied: boolean;
    isOriginallySupplied: boolean;
    isCanceled: boolean;
}
export interface IssueDocument extends IssueRow {
    details: IssueDetail[];
}
export interface IssueValues {
    clientId: string;
    advisorId: string;
    departmentId: string;
    requesterId: string;
    projectNumber: string;
    requestDate: string;
    observations: string;
    details: IssueDetail[];
}
export type IssueField = keyof IssueValues;
export type IssueWriteMode = 'create' | 'edit' | 'header' | 'supply';
export type IssueOpenMode = 'edit' | 'view' | 'supply' | 'return';
export type IssueWriteTarget =
    | { mode: 'create'; document?: never }
    | { mode: Exclude<IssueWriteMode, 'create'>; document: IssueDocument };
export type IssueTarget = IssueWriteTarget | { mode: 'view' | 'return'; document: IssueDocument };
export interface IssueFilters {
    startDate: string;
    endDate: string;
    clientId: string;
    departmentId: string;
    personId: string;
    fulfillmentStatusId: string;
    observationsSearch: string;
}
export type IssueQuery = RecordQuery & IssueFilters;
export type IssueLookup = 'clients' | 'departments' | 'persons' | 'statuses' | 'items';
export interface IssueHeaderSelect {
    field: 'clientId' | 'advisorId' | 'departmentId' | 'requesterId';
    kind: 'clients' | 'advisors' | 'departments' | 'requesters';
    label: string;
    state: LookupState;
    initialOption?: LookupItem;
    isDisabled: boolean;
    hint: string;
}
export interface IssueFilterSelect {
    field: 'clientId' | 'departmentId' | 'personId' | 'fulfillmentStatusId';
    kind: 'clients' | 'departments' | 'persons' | 'statuses';
    label: string;
    state: LookupState;
    isDisabled: boolean;
}
