export const runManualCapture = async (capture, { timeout, cancel }) => {
    let expired = false;
    let cancellation;
    const timer = setTimeout(() => {
        expired = true;
        cancellation = Promise.resolve()
            .then(cancel)
            .catch(() => {});
    }, timeout);
    try {
        const result = await capture();
        if (expired) throw new Error('La captura terminó después del plazo.');
        return result;
    } catch (cause) {
        if (expired)
            throw new Error(
                `La captura excedió ${timeout / 1000} segundos; su página se canceló antes de continuar.`,
                { cause },
            );
        throw cause;
    } finally {
        clearTimeout(timer);
        await cancellation;
    }
};
