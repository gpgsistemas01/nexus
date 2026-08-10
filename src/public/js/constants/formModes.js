export const FORM_MODES = Object.freeze({
    CREATE: 'create',
    EDIT: 'edit',
    EDIT_STOCK: 'edit-stock',
    EDIT_DETAIL: 'edit-detail',
    EDIT_HEADER: 'edit-header',
    RETURN: 'return',
    VIEW: 'view'
});

export const isCreateMode = (mode) => mode === FORM_MODES.CREATE;
export const isEditMode = (mode) => mode === FORM_MODES.EDIT;
export const isStockMode = (mode) => mode === FORM_MODES.EDIT_STOCK;
