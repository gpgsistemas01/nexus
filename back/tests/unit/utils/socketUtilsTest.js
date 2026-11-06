import http from 'node:http';
import { Server } from 'socket.io';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { verifyAccessToken, getLoggedUser } = vi.hoisted(() => ({
    verifyAccessToken: vi.fn(), getLoggedUser: vi.fn()
}));
vi.mock('../../../src/services/jwtService.js', () => ({ verifyAccessToken }));
vi.mock('../../../src/services/admin/userService.js', () => ({ getLoggedUser }));
vi.mock('../../../src/utils/logger.js', () => ({ logger: { error: vi.fn() } }));
const { initSocket, emitInventoryUpdated } = await import('../../../src/utils/socketUtils.js');

let authenticate;
let io;
const createSocket = (cookie = 'accessToken=valid') => ({
    request: { headers: { cookie } }, data: {}, connected: true,
    emit: vi.fn(), disconnect: vi.fn()
});
const connect = socket => new Promise(resolve => authenticate(socket, resolve));

beforeEach(() => {
    vi.resetAllMocks();
    verifyAccessToken.mockImplementation(token => token === 'valid' ? { id: 'user-1' } : null);
    getLoggedUser.mockResolvedValue({ permissions: ['materials:read'] });
    io = { use: middleware => { authenticate = middleware; }, sockets: { sockets: new Map() } };
    initSocket(io);
});

describe('identidad y permisos de notificaciones Socket.IO', () => {
    it.each(['', 'accessToken=expired', 'refreshToken=valid'])('rechaza sesión ausente o inválida: %s', async cookie => {
        expect(await connect(createSocket(cookie))).toEqual(new Error('UNAUTHORIZED'));
    });

    it('rechaza una cuenta desactivada y fallos de consulta sin detalles internos', async () => {
        getLoggedUser.mockResolvedValueOnce(null).mockRejectedValueOnce(new Error('private database detail'));
        expect(await connect(createSocket())).toEqual(new Error('UNAUTHORIZED'));
        expect(await connect(createSocket())).toEqual(new Error('UNAUTHORIZED'));
    });

    it.each([
        ['material', ['materials:read'], ['materials:updated']],
        ['waste', ['wastes:read'], ['wastes:updated']],
        ['waste', ['movements:read'], ['waste-movements:updated']],
        ['material', ['materials:read', 'movements:read'], ['materials:updated', 'material-movements:updated']],
        ['waste', ['materials:read'], []],
        ['material', [], []]
    ])('filtra contexto %s y permisos %j', async (context, permissions, events) => {
        const socket = createSocket();
        expect(await connect(socket)).toBeUndefined();
        io.sockets.sockets.set('socket-1', socket);
        getLoggedUser.mockResolvedValue({ permissions });
        await emitInventoryUpdated({ context });
        expect(socket.emit.mock.calls.map(([name]) => name)).toEqual(events);
    });

    it('deja de notificar si expira el token o se desactiva la cuenta después de conectar', async () => {
        const socket = createSocket();
        await connect(socket);
        io.sockets.sockets.set('socket-1', socket);
        verifyAccessToken.mockReturnValueOnce(null);
        await emitInventoryUpdated({ context: 'material' });
        expect(socket.disconnect).toHaveBeenCalledWith(true);
        getLoggedUser.mockResolvedValueOnce(null);
        await emitInventoryUpdated({ context: 'material' });
        expect(socket.disconnect).toHaveBeenCalledTimes(2);
        expect(socket.emit).not.toHaveBeenCalled();
    });

    it('no transforma un fallo de notificación en fallo de escritura', async () => {
        const socket = createSocket();
        await connect(socket);
        io.sockets.sockets.set('socket-1', socket);
        getLoggedUser.mockRejectedValue(new Error('database unavailable'));
        await expect(emitInventoryUpdated({ context: 'material' })).resolves.toBeUndefined();
        expect(socket.emit).not.toHaveBeenCalled();
    });
});

describe('autenticación sobre el transporte real Socket.IO', () => {
    it.each(['', 'accessToken=valid'])('aplica la cookie al conectar por polling: %s', async cookie => {
        const server = http.createServer();
        const transport = new Server(server);
        initSocket(transport);
        await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
        const endpoint = `http://127.0.0.1:${server.address().port}/socket.io/?EIO=4&transport=polling`;
        const options = { headers: { cookie }, signal: AbortSignal.timeout(3000) };
        try {
            const handshake = await (await fetch(endpoint, options)).text();
            const { sid } = JSON.parse(handshake.slice(1));
            await fetch(`${endpoint}&sid=${sid}`, { ...options, method: 'POST', body: '40' });
            const response = await (await fetch(`${endpoint}&sid=${sid}`, options)).text();
            if (!cookie) {
                expect(response).toContain('44{"message":"UNAUTHORIZED"}');
                expect(transport.sockets.sockets.size).toBe(0);
            } else {
                expect(response).toMatch(/^40/);
                await emitInventoryUpdated({ context: 'material' });
                const notification = await (await fetch(`${endpoint}&sid=${sid}`, options)).text();
                expect(notification).toContain('42["materials:updated",');
                expect(notification).not.toContain('material-movements:updated');
            }
        } finally {
            await new Promise(resolve => transport.close(resolve));
        }
    });
});
