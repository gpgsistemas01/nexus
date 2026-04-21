export const errorMessages = {
    // 🔐 AUTH / GENERALES
    LOGIN_ERROR: 'Usuario o contraseña incorrectos.',
    VALIDATION_ERROR: 'Errores de validación.',
    INVALID_AUTH: 'Sesión inválida. Inicia sesión nuevamente.',
    INVALID_LINK: 'Enlace inválido. Solicita uno nuevo.',
    SERVER_ERROR: 'Error del servidor.',
    DETECTED_REUSE: 'Reuso de sesión detectado.',

    // SUPPLIER
    SUPPLIER_ID_REQUIRED: 'El proveedor es requerido.',
    INVALID_UUID: 'El proveedor no es válido.',

    // RECEIVED BY
    RECEIVED_BY_ID_REQUIRED: 'La person que recibe es requerida.',
    RECEIVED_BY_ID_INVALID_UUID: 'La persona que recibe no es válida.',

    PROJECT_ID_REQUIRED: 'El proyecto es requerido.',

    PROJECT_ID_INVALID_UUID: 'El proyecto no es válido.',

    REQUESTER_ID_REQUIRED: 'El solicitante es requerido.',

    REQUESTER_ID_INVALID_UUID: 'El solicitante no es válido.',

    REQUEST_DATE_REQUIRED: 'La fecha de solicitud es requerida.',

    REQUEST_DATE_INVALID_FORMAT: 'La fecha de solicitud no es válida.',

    // 👤 USERNAME
    USERNAME_REQUIRED: 'El nombre de usuario es requerido.',
    USERNAME_INVALID_TYPE: 'El nombre de usuario debe ser texto.',
    USERNAME_NO_SPACES: 'El nombre de usuario no debe contener espacios.',
    USERNAME_INVALID_FORMAT: 'Solo se permiten letras, números y guiones bajos.',
    USERNAME_TOO_LONG: 'El nombre de usuario no debe exceder 50 caracteres.',

    // 🔑 PASSWORD
    PASSWORD_REQUIRED: 'La contraseña es requerida.',
    PASSWORD_INVALID_TYPE: 'La contraseña debe ser texto.',
    PASSWORD_NEEDS_NUMBER: 'Debe contener al menos un número.',
    PASSWORD_NEEDS_UPPERCASE: 'Debe contener al menos una mayúscula.',
    PASSWORD_INVALID_FORMAT: 'Debe contener al menos un carácter especial.',
    PASSWORD_TOO_SHORT: 'Debe tener al menos 8 caracteres.',
    PASSWORD_TOO_LONG: 'No debe exceder 50 caracteres.',

    // 🧑 NAME
    NAME_REQUIRED: 'El nombre es requerido.',
    NAME_INVALID_TYPE: 'El nombre debe ser texto.',
    NAME_TOO_LONG: (value) => `El nombre no debe exceder ${value} caracteres.`,
    NAME_INVALID_FORMAT: 'Contiene caracteres no válidos.',

    // 📞 PHONE
    NUMBERPHONE_INVALID_FORMAT: 'El teléfono no es válido.',
    NUMBERPHONE_TOO_LONG: 'El teléfono no debe exceder 20 caracteres.',

    // 💰 UNIT COST
    UNIT_COST_REQUIRED: 'El costo unitario es requerido.',
    UNIT_COST_INVALID_NUMBER: 'El costo debe ser numérico.',
    UNIT_COST_TOO_LONG: 'El costo es demasiado grande.',

    // 📉 MIN STOCK
    MIN_STOCK_REQUIRED: 'El stock mínimo es requerido.',
    MIN_STOCK_INVALID_NUMBER: 'Debe ser un número.',
    MIN_STOCK_GREATER_THAN_MAX: 'El stock mínimo no puede ser mayor al máximo.',

    // RECEPTION DATE
    RECEPTION_DATE_REQUIRED: 'La fecha de recepción es requerida.',
    RECEPTION_DATE_INVALID_FORMAT: 'La fecha de recepción no es válida.',

    // 📐 BASE
    BASE_INVALID_NUMBER: 'Debe ser un número.',
    BASE_TOO_LONG: 'El valor es demasiado grande.',

    // 📏 HEIGHT
    HEIGHT_INVALID_NUMBER: 'Debe ser un número.',
    HEIGHT_TOO_LONG: 'El valor es demasiado grande.',

    // OBSERVATIONS
    OBSERVATIONS_INVALID_TYPE: 'Las observaciones deben ser texto.',
    OBSERVATIONS_TOO_LONG: 'Las observaciones no deben exceder más de 50 caracteres.',

    // 🔘 ACTIVE
    ACTIVE_REQUIRED: 'El estado activo es requerido.',
    ACTIVE_INVALID_BOOLEAN: 'El estado activo debe ser verdadero o falso.',

    // DETAILS
    DETAILS_REQUIRED: 'La lista de detalles debe contener al menos un producto.',
    DETAILS_INVALID_FORMAT_REQUIRED: 'Cada detalle debe contener un producto y una cantidad.',
    DETAILS_INVALID_FORMAT_QUANTITY: 'La cantidad de cada detalle debe ser un número mayor a cero.',
    DETAILS_INVALID_FORMAT_DESCRIPTION: 'Si hay descripción, entonces debe ser texto y no debe ser mayor a 50 caracteres.',

    PROJECT_NOT_FOUND: 'Proyecto no encontrado.',
    REQUESTER_PROFILE_NOT_FOUND: 'Perfil solicitante no encontrado.',
    PURCHASE_REQUISITION_NOT_FOUND: 'Requisición de compra no encontrada.',
    PURCHASE_REQUISITION_STATUS_NOT_FOUND: 'Estado de requisición no encontrado.',
    PURCHASE_REQUISITION_UPDATE_DB_ERROR: 'Error de base de datos al editar la requisición de compra.',
    PURCHASE_REQUISITION_STATUS_UPDATE_DB_ERROR: 'Error de base de datos al editar el estado de la requisición.',
    PURCHASE_REQUISITION_APPROVER_PROFILE_NOT_FOUND: 'Perfil aprobador activo no encontrado para el usuario.',
    GOODS_RECEIPT_NOT_FOUND: 'Recibo de mercancía no encontrado.',
    GOODS_RECEIPT_STATUS_NOT_FOUND: 'Estado de recepción de compra no encontrado.',
    GOODS_RECEIPT_RECEPTION_DATE_REQUIRED: 'La fecha de recepción es obligatoria para actualizar el estado.',
    GOODS_RECEIPT_UPDATE_DB_ERROR: 'Error de base de datos al editar el recibo de mercancía.',
    GOODS_RECEIPT_STATUS_UPDATE_DB_ERROR: 'Error de base de datos al editar el estado de la recepción de compra.',
    GOODS_RECEIPT_APPROVER_PROFILE_NOT_FOUND: 'Perfil aprobador activo no encontrado para el usuario.',
    GOODS_ISSUE_NOT_FOUND: 'Salida de almacén no encontrada.',
    GOODS_ISSUE_UPDATE_DB_ERROR: 'Error de base de datos al editar la salida de almacén.',
    GOODS_ISSUE_STATUS_NOT_FOUND: 'Estado de salida de almacén no encontrado.',
    GOODS_ISSUE_STATUS_UPDATE_DB_ERROR: 'Error de base de datos al editar el estado de la salida de almacén.',
    GOODS_ISSUE_APPROVAL_FORBIDDEN: 'No tienes permisos para aprobar o rechazar salidas de otra área.',
    GOODS_ISSUE_EDIT_FORBIDDEN: 'No tienes permisos para editar salidas de otra área.',
    GOODS_ISSUE_APPROVER_PROFILE_NOT_FOUND: 'Perfil aprobador activo no encontrado para el usuario.',
    GOODS_ISSUE_CONFIRMATION_FORBIDDEN: 'No tienes permisos para confirmar o cancelar salidas de almacén.',
    GOODS_ISSUE_WAREHOUSE_STAFF_PROFILE_NOT_FOUND: 'Perfil de almacenista activo no encontrado para el usuario.',
    PRODUCT_NOT_FOUND: 'Producto no encontrado.',
    PRODUCT_CREATE_DB_ERROR: 'Error de base de datos al crear el producto.',
    PRODUCT_UPDATE_DB_ERROR: 'Error de base de datos al editar el producto.',
    EXCEDED_MAX_RETRIES_SKU: 'Excedido el número máximo de intentos para generar un SKU único.',
    DEPARTMENT_NOT_FOUND: 'Departamento no encontrado.',
    PROFILE_RECEIVED_BY_NOT_FOUND: 'Perfil de quien recibe no encontrado.',
    PROFILE_NOT_FOUND: 'Perfil no encontrado.',
    SUPPLIER_NOT_FOUND: 'Proveedor no encontrado.',
    SUPPLIER_UPDATE_DB_ERROR: 'Error de base de datos al editar el proveedor.'
};

const successMessages = {
    CREATED_ACCOUNT: '¡Cuenta registrada exitosamente!',
    UPDATED_ACCOUNT: '¡Cuenta actualizada con éxito!',
    SUCCESS_LOGIN: '¡Inicio de sesión exitoso!',
    SUCCESS_LOGOUT: 'Sesión cerrada exitosamente.',
    CREATED_PRODUCT: '¡Producto creada exitosamente!',
    UPDATED_PRODUCT: '¡Producto actuallizada exitosamente!',
    CREATED_SUPPLIER: '¡Proveedor creada exitosamente!',
    UPDATED_SUPPLIER: '¡Proveedor actuallizada exitosamente!',
    CREATED_GOODS_RECEIPT: '¡Entrada de mercancía creada exitosamente!',
    UPDATED_GOODS_RECEIPT: '¡Entrada de mercancía actualizada exitosamente!',
    CONFIRMED_GOODS_RECEIPT: '¡Entrada de mercancía confirmada exitosamente!',
    CANCELED_GOODS_RECEIPT: '¡Entrada de mercancía cancelada exitosamente!',
    CREATED_GOODS_ISSUE: '¡Salida de almacén creada exitosamente!',
    UPDATED_GOODS_ISSUE: '¡Salida de almacén actualizada exitosamente!',
    CONFIRMED_GOODS_ISSUE: '¡Salida de almacén confirmada exitosamente!',
    CANCELED_GOODS_ISSUE: '¡Salida de almacén cancelada exitosamente!',
    APPROVED_GOODS_ISSUE: '¡Salida de almacén aprobada exitosamente!',
    REJECTED_GOODS_ISSUE: '¡Salida de almacén rechazada exitosamente!',
    CREATED_PURCHASE_REQUISITION: '¡Requisición de compra creada exitosamente!',
    UPDATED_PURCHASE_REQUISITION: '¡Requisición de compra actualizada exitosamente!',
    CONFIRMED_PURCHASE_REQUISITION: '¡Requisición de compra confirmada exitosamente!',
    CANCELED_PURCHASE_REQUISITION: '¡Requisición de compra cancelada exitosamente!'
};

export const getErrorMessage = (error) => {

    if (typeof error === 'string') return errorMessages[error] ?? null;

    if (typeof error === 'object') {

        const fn = errorMessages[error.code];

        return typeof fn === 'function' ? fn(error.meta) : null;
    }
    
    return null;
}

export const getSuccessMessage = (code) => successMessages[code] ?? null;
