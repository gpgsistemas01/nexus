import { AppError } from "../AppError.js";

export class ProfileFindDatabaseError extends AppError {

    constructor () {
        super('Error de base de datos al buscar el perfil', 'PROFILE_FIND_DB_ERROR', 500);
    }
}