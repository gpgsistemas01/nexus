import { AppError } from "../AppError.js";

export class PersonFindDatabaseError extends AppError {

    constructor () {
        super('Error de base de datos al buscar la persona', 'PERSON_FIND_DB_ERROR', 500);
    }
}

export class PersonCreateDatabaseError extends AppError {

    constructor () {
        super('Error de base de datos al crear la persona', 'PERSON_CREATE_DB_ERROR', 500);
    }
}

export class PersonUpdateDatabaseError extends AppError {

    constructor () {
        super('Error de base de datos al actualizar la persona', 'PERSON_UPDATE_DB_ERROR', 500);
    }
}