import { AppError } from "./AppError.js";
import { errorMap } from "../messages/codeMessages.js";
import { errorMessages } from "../shared/messages/apiMessages.js";

export class ForbiddenError extends AppError {
    constructor(message = errorMessages[errorMap.message.FORBIDDEN]) {
        super(message, errorMap.message.FORBIDDEN, 403);
    }
}

export class loginError extends AppError {

    constructor() {
        super('Usuario o contraseña incorrectos.', 'LOGIN_ERROR', 401);
    }
}

export class authError extends AppError {

    constructor() {
        super('No autorizado', 'INVALID_AUTH', 401);
    }
}
