export class AppError extends Error {

    constructor(message, code, statusCode) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

export const isAppError = (err) => Boolean(
    err instanceof AppError || (
        err?.isOperational === true &&
        typeof err?.code === 'string' &&
        Number.isInteger(err?.statusCode)
    )
);
