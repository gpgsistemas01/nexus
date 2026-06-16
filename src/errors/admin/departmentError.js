import { AppError } from "../AppError.js";

export class DepartmentNotFound extends AppError {

    constructor () {
        super('Área no encontrada', 'DEPARTMENT_NOT_FOUND', 404);
    }
}

export class DepartmentFindDatabaseError extends AppError {

    constructor () {
        super('Error de la base de datos al buscar el área', 'DEPARTMENT_FIND_DB_ERROR', 500);
    }
}