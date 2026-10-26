export interface LookupItem {
    id: string;
    title: string;
    data: Record<string, unknown>;
    isDisabled?: boolean;
}

export interface LookupState {
    items: LookupItem[];
    isLoading: boolean;
    error: string;
    hasMore: boolean;
}
export interface LookupCreation {
    search: string;
    onCreated: (item: LookupItem) => void;
}
export type OrganizationResource = 'departments' | 'roles';
export type OrganizationState = Record<OrganizationResource, LookupState>;
