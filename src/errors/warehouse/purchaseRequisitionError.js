import { AppError } from "../AppError.js";

export class PurchaseRequisitionNotFound extends AppError {

    constructor() {
        super('Requisición de compra no encontrada', 'PURCHASE_REQUISITION_NOT_FOUND', 404);
    }
}

export class ProjectNotFound extends AppError {

    constructor() {
        super('Proyecto no encontrado', 'PROJECT_NOT_FOUND', 404);
    }
}

export class RequesterPersonNotFound extends AppError {

    constructor() {
        super('Persona solicitante no encontrada', 'REQUESTER_PERSON_NOT_FOUND', 404);
    }
}

export class PurchaseRequisitionStatusNotFound extends AppError {

    constructor() {
        super('Estado de requisición no encontrado', 'PURCHASE_REQUISITION_STATUS_NOT_FOUND', 404);
    }
}

export class PurchaseRequisitionUpdateDatabaseError extends AppError {

    constructor() {
        super('Error de base de datos al editar la requisición de compra', 'PURCHASE_REQUISITION_UPDATE_DB_ERROR', 500);
    }
}

export class PurchaseRequisitionStatusUpdateDatabaseError extends AppError {

    constructor() {
        super('Error de base de datos al editar el estado de la requisición', 'PURCHASE_REQUISITION_STATUS_UPDATE_DB_ERROR', 500);
    }
}

export class PurchaseRequisitionApproverPersonNotFound extends AppError {

    constructor() {
        super('Persona aprobadora activa no encontrada para el usuario', 'PURCHASE_REQUISITION_APPROVER_PERSON_NOT_FOUND', 404);
    }
}
