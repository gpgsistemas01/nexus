export const registerServerLifecycle = ({
    server, io, prisma, logger, setReady, processRef = process, timeoutMs = 10000
}) => {
    let shutdownPromise;

    const shutdown = (signal) => {
        if (shutdownPromise) return shutdownPromise;
        setReady(false);
        logger.info({ signal }, 'Cierre del servidor iniciado');

        const deadline = setTimeout(() => {
            logger.error('El cierre del servidor excedió el plazo');
            io.disconnectSockets(true);
            server.closeAllConnections();
            processRef.exit(1);
        }, timeoutMs);

        shutdownPromise = (async () => {
            try {
                const httpClosed = new Promise((resolve, reject) => {
                    server.close(error => {
                        if (error && error.code !== 'ERR_SERVER_NOT_RUNNING') return reject(error);
                        resolve();
                    });
                });
                const socketsClosed = new Promise(resolve => io.close(resolve));
                await Promise.all([httpClosed, socketsClosed]);
                await prisma.$disconnect();
                logger.info('Cierre del servidor completado');
            } catch (err) {
                logger.error({ err }, 'Error durante el cierre del servidor');
                processRef.exit(1);
            } finally {
                clearTimeout(deadline);
                processRef.off('SIGTERM', onTerm);
                processRef.off('SIGINT', onInterrupt);
            }
        })();

        return shutdownPromise;
    };

    const onTerm = () => { void shutdown('SIGTERM'); };
    const onInterrupt = () => { void shutdown('SIGINT'); };
    processRef.on('SIGTERM', onTerm);
    processRef.on('SIGINT', onInterrupt);
    return shutdown;
};
