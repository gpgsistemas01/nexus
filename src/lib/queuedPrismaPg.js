import { PrismaPg } from '@prisma/adapter-pg';

// Compatibilidad con pg: Prisma 7 carga relaciones en paralelo dentro de una transacción.
// La cola pertenece a esa transacción; las consultas del pool mantienen su concurrencia.
// Revisar al resolver https://github.com/prisma/orm/issues/29407.
export class QueuedPrismaPg extends PrismaPg {
    async connect() {
        const adapter = await super.connect();
        const startTransaction = adapter.startTransaction.bind(adapter);

        adapter.startTransaction = async (...args) => {
            const transaction = await startTransaction(...args);
            let pending = Promise.resolve();

            for (const method of ['queryRaw', 'executeRaw']) {
                const execute = transaction[method].bind(transaction);
                transaction[method] = (...queryArgs) => {
                    const result = pending.then(() => execute(...queryArgs));
                    // Liberar la cola tras un fallo no cambia el rechazo recibido por Prisma.
                    pending = result.then(() => undefined, () => undefined);
                    return result;
                };
            }

            return transaction;
        };

        return adapter;
    }
}
