import { AppError } from '../AppError.js';
import { errorMap } from '../../messages/codeMessages.js';

export class WasteIssueNotFound extends AppError {

    constructor() {
        super('La salida de merma no existe.', 'WASTE_ISSUE_NOT_FOUND', 404);
    }
}

export class WasteIssueStockConflict extends AppError {
    constructor({ materialName }) {
        super(`Stock insuficiente para surtir la merma: ${ materialName }.`, 'WASTE_ISSUE_STOCK_CONFLICT', 409);
    }
}

export class WasteIssueStateConflict extends AppError {
    constructor() {
        super('La salida de merma no tiene detalles pendientes por surtir.', errorMap.wasteIssue.STATE_CONFLICT, 409);
    }
}

export class WasteIssueDuplicateWasteConflict extends AppError {
    constructor() {
        super('No se puede repetir la misma merma en una salida.', errorMap.wasteIssue.DUPLICATE_WASTE, 409);
    }
}

export class WasteIssueWasteUnavailableConflict extends AppError {
    constructor() {
        super('Una o más mermas no existen o están inactivas.', errorMap.wasteIssue.WASTE_UNAVAILABLE, 409);
    }
}

export class WasteIssueFulfillmentStatusNotFound extends AppError {
    constructor() {
        super('No se encontraron los estados de surtido requeridos.', errorMap.wasteIssue.FULFILLMENT_STATUS_NOT_FOUND, 500);
    }
}

export class WasteIssueAlreadySuppliedConflict extends AppError {
    constructor() {
        super('La salida de merma ya tiene detalles surtidos y solo puede editarse el encabezado.', 'WASTE_ISSUE_ALREADY_SUPPLIED_CONFLICT', 409);
    }
}

export class WasteIssueDetailNotFound extends AppError {

    constructor() {
        super(
            'Uno o más detalles no pertenecen a la salida de merma.',
            'WASTE_ISSUE_DETAIL_NOT_FOUND',
            404
        );
    }
}

export class WasteIssueRequesterNotFound extends AppError {

    constructor() {
        super('El solicitante de la salida de merma no existe.', 'WASTE_ISSUE_REQUESTER_NOT_FOUND', 404);
    }
}

export class WasteIssueAdvisorNotFound extends AppError {

    constructor() {
        super('El asesor de la salida de merma no existe.', 'WASTE_ISSUE_ADVISOR_NOT_FOUND', 404);
    }
}

export class WasteIssueClientAdvisorConflict extends AppError {

    constructor() {
        super('El asesor no corresponde al cliente seleccionado.', 'WASTE_ISSUE_CLIENT_ADVISOR_CONFLICT', 409);
    }
}

export class WasteIssueProjectNumberConflict extends AppError {

    constructor() {
        super('El número de proyecto no corresponde al cliente y área seleccionados.', 'WASTE_ISSUE_PROJECT_NUMBER_CONFLICT', 409);
    }
}

export class WasteIssueReturnQuantityConflict extends AppError {
    constructor() {
        super('La cantidad a devolver no es válida.', 'WASTE_ISSUE_RETURN_QUANTITY_CONFLICT', 409);
    }
}

export class WasteIssueReturnStatusConflict extends AppError {
    constructor() {
        super('Solo se pueden devolver detalles de una salida surtida.', 'WASTE_ISSUE_RETURN_STATUS_CONFLICT', 409);
    }
}

export class WasteIssueCreateDatabaseError extends AppError {
    constructor() {
        super('Error de base de datos al crear la salida de merma.', 'WASTE_ISSUE_CREATE_DB_ERROR', 500);
    }
}

export class WasteIssueUpdateDatabaseError extends AppError {
    constructor() {
        super('Error de base de datos al editar la salida de merma.', 'WASTE_ISSUE_UPDATE_DB_ERROR', 500);
    }
}

export class WasteIssueReturnDatabaseError extends AppError {
    constructor() {
        super('Error de base de datos al registrar la devolución de merma.', 'WASTE_ISSUE_RETURN_DB_ERROR', 500);
    }
}
