const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

export const isTimeoutError = error => {
    let currentError = error;
    while (currentError) {
        if (currentError.name === 'TimeoutError'
            || /timeout|tiempo límite/i.test(String(currentError.message ?? ''))) return true;
        currentError = currentError.cause;
    }
    return false;
};

export const captureWithRecovery = async ({
    context,
    capture,
    capturePage,
    retries,
    retryDelay,
    onRetry
}) => {
    for (let attempt = 0; attempt <= retries; attempt += 1) {
        const page = await context.newPage();
        try {
            await capturePage(page, capture);
            return;
        } catch (error) {
            if (!isTimeoutError(error) || attempt === retries) throw error;
            onRetry(attempt + 1);
        } finally {
            await page.close();
        }

        await delay(retryDelay);
    }
};
