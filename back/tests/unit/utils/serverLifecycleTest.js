import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EventEmitter } from 'node:events';
import { registerServerLifecycle } from '../../../src/utils/serverLifecycle.js';

let runtime;
let finishHttp;
let finishSockets;
let shutdown;
beforeEach(() => {
    const processRef = new EventEmitter();
    processRef.exit = vi.fn();
    runtime = {
        server: { close: vi.fn(callback => { finishHttp = callback; }), closeAllConnections: vi.fn() },
        io: { close: vi.fn(callback => { finishSockets = callback; }), disconnectSockets: vi.fn() },
        prisma: { $disconnect: vi.fn().mockResolvedValue() },
        logger: { info: vi.fn(), error: vi.fn() },
        setReady: vi.fn(), processRef, timeoutMs: 100
    };
    shutdown = registerServerLifecycle(runtime);
});
afterEach(() => vi.useRealTimers());

describe('cierre del proceso', () => {
    it.each(['SIGTERM', 'SIGINT'])('drena HTTP y sockets antes de cerrar Prisma con %s', async signal => {
        runtime.processRef.emit(signal, signal);
        const completion = shutdown(signal);
        expect(shutdown(signal)).toBe(completion);
        expect(runtime.setReady).toHaveBeenCalledWith(false);
        expect(runtime.prisma.$disconnect).not.toHaveBeenCalled();
        finishSockets();
        await Promise.resolve();
        expect(runtime.prisma.$disconnect).not.toHaveBeenCalled();
        finishHttp();
        await completion;
        expect(runtime.prisma.$disconnect).toHaveBeenCalledTimes(1);
        expect(runtime.processRef.exit).not.toHaveBeenCalled();
        expect(runtime.processRef.listenerCount(signal)).toBe(0);
    });
    it('fuerza salida fallida si una conexión impide terminar', async () => {
        vi.useFakeTimers();
        const completion = shutdown('SIGTERM');
        await vi.advanceTimersByTimeAsync(100);
        expect(runtime.server.closeAllConnections).toHaveBeenCalledOnce();
        expect(runtime.io.disconnectSockets).toHaveBeenCalledWith(true);
        expect(runtime.processRef.exit).toHaveBeenCalledWith(1);
        finishHttp(); finishSockets();
        await completion;
    });
    it('tolera un servidor que aún no estaba escuchando', async () => {
        const completion = shutdown('server-error');
        finishHttp(Object.assign(new Error(), { code: 'ERR_SERVER_NOT_RUNNING' }));
        finishSockets();
        await completion;
        expect(runtime.prisma.$disconnect).toHaveBeenCalledOnce();
    });
});
