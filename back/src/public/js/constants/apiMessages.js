import { successCodeMessages } from '../../../shared/constants/apiSuccessCodes.js';
import { AUTH_FIELD_LIMITS } from '../../../shared/constants/auth.js';
import { FORM_FIELD_LIMITS } from '../../../shared/constants/inputValidation.js';
import { buildGoodsReceiptInvoiceAlreadyExistsMessage } from '../../../shared/messages/goodsReceiptMessages.js';

export const errorMessages = {
    RECORD_ID_INVALID: 'El identificador del registro no es válido.',
    DATABASE_TABLE_MISSING: 'Falta una tabla requerida en la base de datos. Contacta a soporte.',
    DATABASE_COLUMN_MISSING: 'Falta una columna requerida en la base de datos. Contacta a soporte.',
    PRISMA_CLIENT_OUT_OF_SYNC: 'El cliente de base de datos no está actualizado. Contacta a soporte.',
    WASTE_NOT_FOUND: 'La merma no existe.',
    OPERATION_ID_REQUIRED: 'Falta la clave de la operación.',
    OPERATION_ID_INVALID: 'La clave de la operación no es válida.',
    RECORD_VERSION_REQUIRED: 'Actualice la información antes de guardar.',
    OPERATION_KEY_CONFLICT: 'La clave corresponde a otra captura. Recupere la operación pendiente.',
    RECORD_VERSION_CONFLICT: 'El registro cambió. Actualice la información y revise la captura.',
    WASTE_ISSUE_STATE_CONFLICT: 'La salida de merma no tiene detalles pendientes por surtir. Actualice la información.',
    WASTE_ISSUE_DUPLICATE_WASTE: 'No se puede repetir la misma merma en una salida.',
    WASTE_ISSUE_WASTE_UNAVAILABLE: 'Una o más mermas no existen o están inactivas. Actualice la selección.',
    WASTE_ISSUE_FULFILLMENT_STATUS_NOT_FOUND: 'No están configurados los estados de surtido. Contacte al administrador.',
    MATERIAL_ROLL_REFERENCE_INVALID: 'La referencia sólo aplica a materiales con presentación Rollo.',
    MATERIAL_ROLL_REFERENCE_READ_ONLY: 'Los pesos del rollo completo son históricos. Capture el peso del rollo completo al registrar merma.',
    WASTE_DIMENSIONS_INVALID: 'Complete las dimensiones de la merma o los pesos necesarios para calcularlas.',
    WASTE_MATERIAL_INVALID: 'Seleccione un material con unidad de metro cuadrado (m²) para registrar merma.',
    REFERENCE_ROLL_TOTAL_WEIGHT_REQUIRED: 'Capture el peso del rollo completo con cono.',
    REFERENCE_ROLL_TOTAL_WEIGHT_NOT_GREATER: 'El peso del rollo completo debe ser mayor que el peso del cono.',
    SAMPLE_LENGTH_REQUIRED: 'Capture el largo de la muestra.',
    SAMPLE_LENGTH_INVALID_NUMBER: 'El largo de la muestra debe ser mayor que cero.',
    SAMPLE_LENGTH_TOO_LONG: 'El largo de la muestra admite hasta 8 enteros y 6 decimales.',
    SAMPLE_WEIGHT_REQUIRED: 'Capture el peso neto de la muestra.',
    SAMPLE_WEIGHT_INVALID_NUMBER: 'El peso neto de la muestra debe ser mayor que cero.',
    SAMPLE_WEIGHT_TOO_LONG: 'El peso neto de la muestra admite hasta 8 enteros y 6 decimales.',
    CONE_WEIGHT_KG_INVALID_NUMBER: 'El peso del cono debe ser un decimal mayor o igual que cero en kg. Use punto decimal, sin letras ni notación científica.',
    CONE_WEIGHT_KG_REQUIRED: 'Capture el peso del cono para calcular el peso neto de la merma.',
    TOTAL_WEIGHT_KG_REQUIRED: 'Capture el peso total con cono para calcular el peso neto de la merma.',
    WASTE_TOTAL_WEIGHT_NOT_GREATER: 'El peso total con cono debe ser mayor que el peso del cono.',
    WASTE_WEIGHT_CALCULATED: 'El peso neto se calcula automáticamente. Capture el peso del cono y el peso total con cono.',
    WEIGHT_KG_INVALID_NUMBER: 'El peso por unidad debe ser un decimal mayor que cero en kg. Use punto decimal, sin letras ni notación científica.',
    WEIGHT_KG_TOO_LONG: 'El peso admite hasta 3 dígitos enteros y 2 decimales.',
    WEIGHT_KG_TOO_HIGH: 'El peso por unidad no puede superar 999.99 kg.',
    WASTE_WEIGHT_READ_ONLY: 'No se pueden modificar los pesos de una merma ya registrada. Estos datos sólo están disponibles para consulta.',
    WASTE_WEIGHT_INVALID: 'Capture pesos válidos de cono, merma y rollo completo; sólo aplican a Rollo.',
    // 🔐 AUTH / GENERALES
    LOGIN_ERROR: 'Usuario o contraseña incorrectos.',
    VALIDATION_ERROR: 'Errores de validación.',
    INVALID_AUTH: 'Sesión inválida. Inicia sesión nuevamente.',
    FORBIDDEN: 'No tienes permisos para realizar esta acción.',
    INVALID_LINK: 'Enlace inválido. Solicita uno nuevo.',
    SERVER_ERROR: 'Error del servidor.',
    DETECTED_REUSE: 'Reuso de sesión detectado.',

    // SUPPLIER
    SUPPLIER_ID_REQUIRED: 'El proveedor es requerido.',
    SUPPLIER_ID_INVALID_UUID: 'El proveedor no es válido.',
    MATERIAL_ID_REQUIRED: 'El material es requerido.',
    MATERIAL_ID_INVALID_UUID: 'El material no es válido.',
    SUPPLIER_MATERIAL_ID_REQUIRED: 'El material es requerido.',
    SUPPLIER_MATERIAL_ID_INVALID_UUID: 'El material no es válido.',
    QUANTITY_REQUIRED: 'La cantidad es requerida.',
    QUANTITY_INVALID_NUMBER: 'La cantidad debe ser un número.',
    QUANTITY_TOO_LONG: 'La cantidad admite hasta 8 enteros y 2 decimales.',
    RETURN_QUANTITY_REQUIRED: 'La cantidad a devolver es requerida.',
    RETURN_QUANTITY_INVALID_NUMBER: 'La cantidad a devolver debe ser mayor a cero.',
    RETURN_QUANTITY_TOO_LONG: 'La cantidad a devolver admite hasta 8 enteros y 2 decimales.',
    COST_PER_UNIT_REQUIRED: 'El costo por presentación es requerido.',
    COST_PER_UNIT_INVALID_NUMBER: 'El costo por presentación debe ser mayor a cero.',
    COST_PER_UNIT_TOO_LONG: 'El costo por presentación admite hasta 8 enteros y 6 decimales.',
    CURRENT_STOCK_REQUIRED: 'El stock es requerido.',
    CURRENT_STOCK_INVALID_NUMBER: 'El stock debe ser un número.',
    CURRENT_STOCK_TOO_LONG: 'El stock admite hasta 8 enteros y 2 decimales.',
    SUPPLIER_NOT_FOUND: 'Proveedor no encontrado.',
    SUPPLIER_CODE_NOT_FOUND: 'Código del proveedor no encontrado.',
    SUPPLIER_FIND_DB_ERROR: 'Error de base de datos al buscar el proveedor',
    SUPPLIER_CREATE_DB_ERROR: 'Error de base de datos al crear el proveedor',
    SUPPLIER_UPDATE_DB_ERROR: 'Error de base de datos al editar el proveedor.',
    SUPPLIER_CODE_FIND_DB_ERROR: 'Error de base de datos al buscar el código del proveedor',

    // RECEIVED BY
    RECEIVED_BY_ID_REQUIRED: 'La persona que recibe es requerida.',
    RECEIVED_BY_ID_INVALID_UUID: 'La persona que recibe no es válida.',
    PERSON_RECEIVED_BY_NOT_FOUND: 'Persona que recibe no encontrada.',

    ADVISOR_ID_REQUIRED: 'El asesor es requerido.',
    ADVISOR_ID_INVALID_UUID: 'El asesor no es válido.',
    ADVISOR_PERSON_NOT_FOUND: 'Persona asesora no encontrada.',

    REQUESTER_ID_REQUIRED: 'El solicitante es requerido.',
    REQUESTER_ID_INVALID_UUID: 'El solicitante no es válido.',
    REQUESTER_PERSON_NOT_FOUND: 'Persona solicitante no encontrada.',

    PERSON_CREATE_DB_ERROR: 'Error de base de datos al crear la persona.',
    PERSON_UPDATE_DB_ERROR: 'Error de base de datos al editar la persona.',

    PROJECT_NUMBER_REQUIRED: 'El número de proyecto es requerido.',
    PROJECT_NUMBER_INVALID_TYPE: 'El número de proyecto debe ser texto.',
    PROJECT_NUMBER_TOO_LONG: `El número de proyecto no debe exceder ${FORM_FIELD_LIMITS.PROJECT_NUMBER} caracteres.`,
    PROJECT_NUMBER_INVALID_FORMAT: 'El número de proyecto no debe contener caracteres de control.',

    CLIENT_ID_REQUIRED: 'El cliente es requerido.',
    CLIENT_ID_INVALID_UUID: 'El cliente no es válido.',

    DEPARTMENT_ID_REQUIRED: 'El departamento es requerido.',
    DEPARTMENT_ID_INVALID_UUID: 'El departamento no es válido.',
    DEPARTMENT_NOT_FOUND: 'Departamento no encontrado.',

    PRESENTATION_ID_REQUIRED: 'La presentación es requerida.',
    PRESENTATION_ID_INVALID_UUID: 'La presentación no es válida.',
    PRESENTATION_NOT_FOUND: 'Presentación no encontrada.',
    PRESENTATION_FIND_DB_ERROR: 'Error de base de datos al buscar la presentación.',

    UNIT_MEASURE_ID_REQUIRED: 'La unidad es requerida.',
    UNIT_MEASURE_ID_INVALID_UUID: 'La unidad no es válida.',
    UNIT_MEASURE_NOT_FOUND: 'Unidad no encontrada.',
    UNIT_MEASURE_FIND_DB_ERROR: 'Error de base de datos al buscar la unidad.',

    DEPARTMENT_FIND_DB_ERROR: 'Error de la base de datos al buscar el área.',

    CLIENT_NOT_FOUND: 'Cliente no encontrado.',
    CLIENT_FIND_DB_ERROR: 'Error de la base de datos al buscar el cliente.',
    CLIENT_CREATE_DB_ERROR: 'Error de la base de datos al crear el cliente.',
    CLIENT_UPDATE_DB_ERROR: 'Error de la base de datos al editar el cliente.',

    REQUEST_DATE_REQUIRED: 'La fecha de solicitud es requerida.',
    REQUEST_DATE_INVALID_FORMAT: 'La fecha de solicitud no es válida.',

    REASON_ID_REQUIRED: 'La razón es requerida.',
    REASON_ID_INVALID_UUID: 'La razón no es válida.',

    DEPARTMENTS_REQUIRED: 'Los departamentos son requeridos.',
    DEPARTMENTS_INVALID_FORMAT: 'Los departamentos seleccionados no son válidos.',
    CATALOG_NOT_FOUND: meta => `El catálogo ${ meta.catalogName || 'solicitado' } no está disponible.`,
    CATALOG_ENTRY_NOT_FOUND: meta => `El registro de ${ meta.catalogLabel || 'Catálogos' } no está disponible.`,
    CATALOG_VALIDATION_ERROR: meta => `Revise los campos obligatorios de ${ meta.catalogLabel || 'Catálogos' }.`,
    PERSON_ACCESSES_INVALID_FORMAT: 'Cada acceso debe contener un área y un rol válidos.',
    MIN_STOCK_TOO_LONG: 'El stock mínimo admite hasta 12 enteros y 2 decimales.',
    MIN_STOCK_INVALID_NUMBER: 'El stock mínimo debe ser un número mayor o igual a cero.',
    PERSON_ACCESSES_REQUIRED: 'Seleccione un área y un rol, y agréguelos a la tabla antes de guardar.',
    PERSON_ACCESSES_DUPLICATE_DEPARTMENT: 'Elimine el área repetida; cada área sólo puede tener un rol para la persona.',
    PERSON_ACCESSES_INVALID_DEPARTMENT: 'Revise los accesos y vuelva a seleccionar el área que ya no sea válida.',
    PERSON_ACCESSES_INVALID_ROLE: 'Revise los accesos y vuelva a seleccionar el rol que ya no sea válido.',

    // 👤 USERNAME
    USERNAME_REQUIRED: 'El nombre de usuario es requerido.',
    USERNAME_INVALID_TYPE: 'El nombre de usuario debe ser texto.',
    USERNAME_NO_SPACES: 'El nombre de usuario no debe contener espacios.',
    USERNAME_INVALID_FORMAT: 'Solo se permiten letras, números y guiones bajos.',
    USERNAME_TOO_LONG: 'El nombre de usuario no debe exceder 50 caracteres.',

    // 🔑 PASSWORD
    PASSWORD_REQUIRED: 'La contraseña es requerida.',
    PASSWORD_INVALID_TYPE: 'La contraseña debe ser texto.',
    PASSWORD_NEEDS_NUMBER: 'La contraseña debe contener al menos un número.',
    PASSWORD_NEEDS_UPPERCASE: 'La contraseña debe contener al menos una mayúscula.',
    PASSWORD_INVALID_FORMAT: 'La contraseña contiene caracteres no permitidos.',
    PASSWORD_TOO_SHORT: `La contraseña debe tener al menos ${ AUTH_FIELD_LIMITS.PASSWORD_MIN_LENGTH } caracteres.`,
    PASSWORD_TOO_LONG: 'La contraseña no debe exceder 50 caracteres.',

    // 🧑 NAME
    NAME_REQUIRED: 'El nombre es requerido.',
    NAME_INVALID_TYPE: 'El nombre debe ser texto.',
    NAME_TOO_LONG: (meta) => `El nombre no debe exceder ${meta.value} caracteres.`,
    NAME_INVALID_FORMAT: 'El nombre contiene caracteres no válidos.',

    INVOICE_REQUIRED: 'El número de factura es requerido.',
    INVOICE_INVALIDA_TYPE: 'El número de factura debe ser texto.',
    INVOICE_TOO_LONG: (meta) => `El número de factura no debe exceder ${meta.value} caracteres.`,
    INVOICE_INVALIDA_FORMAT: 'El número de factura debe contener letras, números y guiones',

    // 📉 MIN STOCK
    MIN_STOCK_REQUIRED: 'El stock mínimo es requerido.',
    MIN_STOCK_INVALID_NUMBER: 'Debe ser un número.',
    MIN_STOCK_GREATER_THAN_MAX: 'El stock mínimo no puede ser mayor al máximo.',

    // 💰 MAX UNIT COST
    MAX_UNIT_COST_REQUIRED: 'El costo máximo es requerido.',
    MAX_UNIT_COST_INVALID_NUMBER: 'El costo máximo debe ser un número.',
    MAX_UNIT_COST_TOO_LONG: 'El costo máximo es demasiado grande.',

    INITIAL_QUANTITY_REQUIRED: 'La cantidad inicial es requerida.',
    INITIAL_QUANTITY_INVALID_NUMBER: 'La cantidad inicial debe ser un número mayor o igual que cero.',
    INITIAL_QUANTITY_TOO_LONG: 'La cantidad inicial admite hasta 8 enteros y 2 decimales.',

    // 📈 NEW STOCK
    NEW_STOCK_REQUIRED: 'El nuevo stock es requerido.',
    NEW_STOCK_INVALID_NUMBER: 'El nuevo stock debe ser un número.',
    NEW_STOCK_TOO_LONG: 'El nuevo stock admite hasta 8 enteros y 2 decimales.',

    REQUIRED_QUANTITY: 'La cantidad es requerido.',
    INVALID_FORMAT_QUANTITY: 'La cantidad debe ser un número mayor a cero.',

    // RECEPTION DATE
    RECEPTION_DATE_REQUIRED: 'La fecha de recepción es requerida.',
    RECEPTION_DATE_INVALID_FORMAT: 'La fecha de recepción no es válida.',

    // 📐 BASE
    BASE_REQUIRED: 'La base es requerida.',
    BASE_INVALID_NUMBER: 'Debe ser un número.',
    BASE_TOO_LONG: 'La base admite hasta 8 enteros y 2 decimales.',

    // 📏 HEIGHT
    HEIGHT_REQUIRED: 'La altura es requerida.',
    HEIGHT_INVALID_NUMBER: 'Debe ser un número.',
    HEIGHT_TOO_LONG: 'La altura admite hasta 8 enteros y 2 decimales.',

    // OBSERVATIONS
    OBSERVATIONS_INVALID_TYPE: 'Las observaciones deben ser texto.',
    OBSERVATIONS_TOO_LONG: (meta) => `Las observaciones no deben exceder más de ${meta.value} caracteres.`,
    OBSERVATIONS_INVALID_FORMAT: 'Las observaciones contienen caracteres no válidos.',

    INVOICED_REQUIRED: 'El tipo de factura debe ser seleccionado.',
    INVOICED_INVALID_BOOLEAN: 'El estado de la factura debe ser verdadero o falso.',

    // 🔘 ACTIVE
    ACTIVE_REQUIRED: 'El estado activo es requerido.',
    ACTIVE_INVALID_BOOLEAN: 'El estado activo debe ser verdadero o falso.',

    SUPPLIED_REQUIRED: 'El estado surtido es requerido.',
    SUPPLIED_INVALID_BOOLEAN: 'El estado surtido debe ser verdadero o falso',

    // DETAILS
    DETAILS_REQUIRED: 'La lista de detalles debe contener al menos un material.',
    DETAILS_INVALID_FORMAT_REQUIRED: 'Cada detalle debe contener un material, una cantidad y un costo por presentación.',
    DETAILS_INVALID_FORMAT_QUANTITY: 'La cantidad de cada detalle debe ser un número mayor a cero.',
    DETAILS_INVALID_FORMAT_SUPPLIER: 'El proveedor de cada detalle es requerido.',
    DETAILS_INVALID_FORMAT_COST_PER_UNIT_TYPE: 'El costo por presentación de cada detalle debe ser un número mayor a cero.',
    DETAILS_INVALID_FORMAT_ID: 'El identificador de cada detalle debe ser un UUID válido.',

    // Códigos de errores de dominio (/errors)
    // Admin / catálogos
    PERSON_NOT_FOUND: 'Persona no encontrada.',
    PERSON_FIND_DB_ERROR: 'Error de base de datos al buscar la persona.',
    ROLE_ID_INVALID_UUID: 'El rol no es válido.',
    ROLE_ID_REQUIRED: 'El rol es requerido.',
    USER_UPDATE_DATABASE_ERROR: 'Error de base de datos al actualizar el usuario.',
    USER_FIND_DATABASE_ERROR: 'Error de base de datos al buscar usuarios.',
    USER_CREATE_DATABASE_ERROR: 'Error de base de datos al crear el usuario.',
    USER_NOT_FOUND: 'Usuario no encontrado.',
    PERSON_CREATE_DB_ERROR: 'Error de base de datos al crear la persona.',
    PERSON_UPDATE_DB_ERROR: 'Error de base de datos al editar la persona.',

    // Warehouse
    EXCEDED_MAX_RETRIES_SKU: 'Excedido el número máximo de intentos para generar un SKU único.',
    GOODS_RECEIPT_NOT_FOUND: 'Recibo de mercancía no encontrado.',
    GOODS_RECEIPT_INVOICE_ALREADY_EXISTS: buildGoodsReceiptInvoiceAlreadyExistsMessage,
    GOODS_RECEIPT_CREATE_DB_ERROR: 'Error de base de datos al crear la compra.',
    GOODS_RECEIPT_UPDATE_DB_ERROR: 'Error de base de datos al actualizar la compra.',
    GOODS_RECEIPT_SUPPLIER_CHANGE_CONFLICT: 'No se puede cambiar el proveedor de una compra confirmada porque sus movimientos de inventario ya están asociados al proveedor original.',
    GOODS_RECEIPT_CORRECTION_NO_CHANGES: 'No hay cambios para aplicar en el detalle de la compra.',
    GOODS_RECEIPT_CORRECTION_QUANTITY_CONFLICT: 'La cantidad corregida debe ser mayor a cero y no exceder la cantidad registrada del detalle.',
    GOODS_RECEIPT_CORRECTION_INSUFFICIENT_STOCK: (meta) => {

        const hasDimensions =
            meta.base != null &&
            meta.height != null;

        const dimensions = hasDimensions
            ? ` (${ meta.base } x ${ meta.height })`
            : '';

        const supplier = meta.supplierName
            ? ` y proveedor: ${ meta.supplierName }`
            : '';

        return `Stock insuficiente para corregir la compra con el material: ${ meta.materialName ?? 'Material desconocido' }${ dimensions }${ supplier }.`;
    },
    GOODS_RECEIPT_DETAIL_ALREADY_CANCELED: 'El detalle de la compra ya está cancelado.',
    GOODS_RECEIPT_CORRECTION_REASON_NOT_FOUND: 'Razón de corrección de compra no encontrada.',
    MATERIAL_NOT_FOUND: 'Material no encontrado.',
    MATERIAL_CREATE_DB_ERROR: 'Error de base de datos al crear el material.',
    MATERIAL_UPDATE_DB_ERROR: 'Error de base de datos al editar el material.',
    MATERIAL_DELETE_DB_ERROR: 'Error de base de datos al eliminar la relación entre el material y el proveedor.',
    MATERIAL_DELETE_RELATION_CONFLICT: 'No se puede eliminar la relación entre el material y el proveedor porque el material tiene historial de compras, salidas, mermas, movimientos o ajustes de stock.',
    WASTE_DELETE_DB_ERROR: 'Error de base de datos al eliminar la merma.',
    WASTE_STOCK_ENTRY_DB_ERROR: 'Error de base de datos al registrar la entrada de merma.',
    MATERIAL_SNAPSHOT_FIND_DB_ERROR: 'Error de base de datos al buscar los datos históricos del material.',
    MATERIAL_STOCK_UPDATE_DB_ERROR: 'Error de base de datos al editar el stock del material.',
    MATERIAL_UNIT_COST_UPDATE_DB_ERROR: 'Error de base de datos al editar el costo unitario del material.',
    SUPPLIER_MATERIAL_CREATE_DB_ERROR: 'Error de base de datos al relacionar el material a un proveedor.',
    SUPPLIER_MATERIAL_DELETE_DB_ERROR: 'Error de base de datos al eliminar la relación entre material y proveedor.',
    GOODS_ISSUE_NOT_FOUND: 'Salida de almacén no encontrada.',
    GOODS_ISSUE_DETAIL_NOT_FOUND: 'Detalle de salida de almacén no encontrado.',
    GOODS_ISSUE_CREATE_DB_ERROR: 'Error de base de datos al crear la salida de almacén.',
    GOODS_ISSUE_UPDATE_DB_ERROR: 'Error de base de datos al editar la salida de almacén.',
    GOODS_ISSUE_INEXISTENT_STOCK: (meta) => {

        const hasDimensions =
            meta.base != null &&
            meta.height != null;

        const dimensions = hasDimensions
            ? ` (${ meta.base } x ${ meta.height })`
            : '';

        const supplier = meta.supplierName
            ? meta.supplierName
            : '';

        return `Stock inexistente para realizar la salida con el material: ${ meta.materialName }${ dimensions } y proveedor: ${ supplier }.`;
    },
    GOODS_ISSUE_INSUFFICIENT_STOCK: (meta) => {

        const hasDimensions =
            meta.base != null &&
            meta.height != null;

        const dimensions = hasDimensions
            ? ` (${ meta.base } x ${ meta.height })`
            : '';

        const supplier = meta.supplierName
            ? meta.supplierName
            : '';

        return `Stock insuficiente para realizar la salida con el material: ${ meta.materialName }${ dimensions } y proveedor: ${ supplier }.`;
    },
    GOODS_ISSUE_MISSING_MAX_UNIT_COST: (meta) => {

        const hasDimensions =
            meta.base != null &&
            meta.height != null;

        const dimensions = hasDimensions
            ? ` (${ meta.base } x ${ meta.height })`
            : '';

        const supplier = meta.supplierName
            ? meta.supplierName
            : '';

        return `No se puede realizar la salida porque el material: ${ meta.materialName } y proveedor: ${ meta.supplierName } no tiene costo unitario máximo configurado.`
    },
    GOODS_ISSUE_NOT_PENDING_CONFLICT: 'La salida solo puede editarse cuando está pendiente.',
    GOODS_ISSUE_SUPPLIED_CONFLICT: 'La salida ya tiene materiales surtidos y no puede editarse en general.',
    GOODS_ISSUE_SUPPLIED_DETAIL_CONFLICT: 'No se pueden editar o eliminar detalles que ya fueron surtidos.',
    GOODS_ISSUE_INTERNAL_CLIENT_ADVISOR_DEPARTMENT_CONFLICT: 'Para el cliente GPG INTERNO, el asesor debe tener el rol Coordinador.',
    GOODS_ISSUE_INTERNAL_CLIENT_PROJECT_NUMBER_CONFLICT: (meta) => `Para el cliente GPG INTERNO, el número de proyecto ${ meta.projectNumber } no coincide con el área ${ meta.departmentName }.`,
    MOVEMENT_DETAIL_RELATION_CONFLICT: 'El detalle del movimiento no está asociado a un material o proveedor.',

    // Documento / folios
    REFERENCE_NUMBER_UPDATE_DB_ERROR: 'Error de base de datos al actualizar el folio.',
    REFERENCE_NUMBER_ALREADY_EXISTS: 'El folio generado ya existe. Intenta realizar la operación nuevamente.',
    MOVEMENT_FIND_DATABASE_ERROR: 'Error de base de datos al buscar el movmiento.'
};

const successMessages = {
    [successCodeMessages.CREATED_ACCOUNT]: '¡Cuenta registrada exitosamente!',
    [successCodeMessages.UPDATED_ACCOUNT]: '¡Cuenta actualizada con éxito!',
    [successCodeMessages.SUCCESS_LOGIN]: '¡Inicio de sesión exitoso!',
    [successCodeMessages.SUCCESS_LOGOUT]: 'Sesión cerrada exitosamente.',
    [successCodeMessages.CREATED_PERSON]: '¡Persona creada exitosamente!',
    [successCodeMessages.UPDATED_PERSON]: '¡Persona actualizada exitosamente!',
    [successCodeMessages.CREATED_MATERIAL]: '¡Material creado exitosamente!',
    [successCodeMessages.UPDATED_MATERIAL]: '¡Material actuallizado exitosamente!',
    [successCodeMessages.DELETED_MATERIAL]: '¡Relación entre material y proveedor eliminada exitosamente!',
    [successCodeMessages.CREATED_SUPPLIER]: '¡Proveedor creado exitosamente!',
    [successCodeMessages.UPDATED_SUPPLIER]: '¡Proveedor actualizado exitosamente!',
    [successCodeMessages.CREATED_GOODS_RECEIPT]: '¡Entrada de mercancía creada exitosamente!',
    [successCodeMessages.UPDATED_GOODS_RECEIPT]: '¡Compra actualizada exitosamente!',
    [successCodeMessages.CREATED_GOODS_ISSUE]: '¡Salida de almacén creada exitosamente!',
    [successCodeMessages.UPDATED_GOODS_ISSUE]: '¡Salida de almacén actualizada exitosamente!',
    [successCodeMessages.CREATED_CLIENT]: '¡Cliente creado exitosamente!',
    [successCodeMessages.CREATED_CATALOG_ENTRY]: '¡Entrada de catálogo creada exitosamente!',
    [successCodeMessages.CREATED_USER]: '¡Usuario creado exitosamente!',
    [successCodeMessages.UPDATED_USER]: '¡Usuario actualizado exitosamente!',
    [successCodeMessages.UPDATED_USER_PASSWORD]: '¡Contraseña actualizada exitosamente!',
    [successCodeMessages.UPDATED_CLIENT]: '¡Cliente actualizado exitosamente!',
    [successCodeMessages.UPDATED_CATALOG_ENTRY]: '¡Entrada de catálogo actualizada exitosamente!',
    [successCodeMessages.CREATED_WASTE]: '¡Merma registrada exitosamente!',
    [successCodeMessages.UPDATED_WASTE]: '¡Merma actualizada exitosamente!',
    [successCodeMessages.DELETED_WASTE]: '¡Merma eliminada exitosamente!',
    [successCodeMessages.CREATED_WASTE_ISSUE]: '¡Salida de merma registrada exitosamente!',
    [successCodeMessages.UPDATED_WASTE_ISSUE]: '¡Salida de merma surtida exitosamente!',
};

export const getErrorMessage = (data = {}) => {

    const { code, meta } = data ?? {};
    const message = errorMessages[code];

    if (typeof message === 'function') return message(meta ?? {});

    if (code) return message ?? data.message ?? code;

    return null;
}

export const getSuccessMessage = (code) => successMessages[code] ?? code;
