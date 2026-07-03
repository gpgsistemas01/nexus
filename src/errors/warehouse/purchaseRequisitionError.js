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

export class RequesterProfileNotFound extends AppError {

    constructor() {
        super('Perfil solicitante no encontrado', 'REQUESTER_PROFILE_NOT_FOUND', 404);
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

export class PurchaseRequisitionApproverProfileNotFound extends AppError {

    constructor() {
        super('Perfil aprobador activo no encontrado para el usuario', 'PURCHASE_REQUISITION_APPROVER_PROFILE_NOT_FOUND', 404);
    }
}
