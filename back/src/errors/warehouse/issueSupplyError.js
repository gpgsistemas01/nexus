import { AppError } from '../AppError.js';

export class IssueSupplyQuantityConflict extends AppError {
    constructor() {
        super('La cantidad a surtir debe ser positiva y no superar el saldo pendiente del detalle.', 'ISSUE_SUPPLY_QUANTITY_CONFLICT', 409);
    }
}
