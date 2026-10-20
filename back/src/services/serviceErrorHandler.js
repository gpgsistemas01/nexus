import { normalizeDatabaseError } from '../errors/databaseError.js';
import { isAppError } from '../errors/AppError.js';
import { getModelLogContext, logServiceError } from '../utils/logger.js';

export const handleServiceError = ({
    logger,
    error,
    operation,
    model,
    data,
    fallbackError
}) => {
    logServiceError(logger, error, {
        operation,
        ...getModelLogContext(model, data)
    });

    const normalizedError = normalizeDatabaseError(error);
    if (isAppError(normalizedError)) throw normalizedError;

    throw fallbackError;
};

export const executeServiceOperation = async ({ action, ...errorContext }) => {
    try {
        return await action();
    } catch (error) {
        handleServiceError({ ...errorContext, error });
    }
};
