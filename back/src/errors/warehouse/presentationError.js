import { AppError } from "../AppError.js";

export class PresentationNotFound extends AppError {

    constructor() {
        super('Presentación no encontrada', 'PRESENTATION_NOT_FOUND', 404);
    }
}