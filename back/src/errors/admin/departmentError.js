import { AppError } from "../AppError.js";

export class DepartmentNotFound extends AppError {

    constructor () {
        super('Área no encontrada', 'DEPARTMENT_NOT_FOUND', 404);
    }
}