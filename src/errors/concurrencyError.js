import { AppError } from './AppError.js';

export class OperationKeyConflictError extends AppError {
    constructor() {
        super('La clave corresponde a otra captura. Recupere la operación pendiente antes de registrar una nueva.', 'OPERATION_KEY_CONFLICT', 409);
    }
}

export class RecordVersionConflictError extends AppError {
    constructor() {
        super('El registro cambió desde que abrió el formulario. Actualice la información y revise la captura.', 'RECORD_VERSION_CONFLICT', 409);
    }
}
