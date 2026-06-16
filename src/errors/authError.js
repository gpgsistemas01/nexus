import { AppError } from "./AppError.js";

export class loginError extends AppError {

    constructor() {
        super('Sesion no valida', 'LOGIN_ERROR', 401);
    }
}

export class authError extends AppError {

    constructor() {
        super('No autorizado', 'INVALID_AUTH', 401);
    }
}

export class detectedReuseError extends AppError {

    constructor() {
        super('Reutilizacion de token detectada', 'DETECTED_REUSE', 403);
    }
}