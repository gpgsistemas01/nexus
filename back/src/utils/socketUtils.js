import cookieParser from 'cookie-parser';
import { verifyAccessToken } from '../services/jwtService.js';
import { getLoggedUser } from '../services/admin/userService.js';
import { hasPermission, PERMISSIONS } from '../shared/constants/permissions.js';
import { logger } from './logger.js';

let socketInstance = null;

const INVENTORY_UPDATE_EVENTS = Object.freeze({
    material: {
        inventory: 'materials:updated',
        movements: 'material-movements:updated'
    },
    waste: {
        inventory: 'wastes:updated',
        movements: 'waste-movements:updated'
    }
});

const loadSocketUser = async (socket) => {
    const tokenInfo = verifyAccessToken(socket.data.accessToken);
    if (!tokenInfo) return null;
    return getLoggedUser(tokenInfo.id);
};

export const initSocket = (io) => {
    socketInstance = io;
    io.use((socket, next) => {
        cookieParser()(socket.request, {}, async error => {
            if (error) return next(new Error('UNAUTHORIZED'));
            try {
                socket.data.accessToken = socket.request.cookies?.accessToken;
                if (!socket.data.accessToken || !await loadSocketUser(socket)) {
                    return next(new Error('UNAUTHORIZED'));
                }
                next();
            } catch (err) {
                logger.error({ err }, 'No se pudo autenticar la conexión Socket.IO');
                next(new Error('UNAUTHORIZED'));
            }
        });
    });
    return socketInstance;
};

export const emitInventoryUpdated = async ({ context, source = 'unknown' }) => {
    if (!socketInstance) return;
    const events = INVENTORY_UPDATE_EVENTS[context];
    if (!events) return;

    const event = { context, source, updatedAt: new Date().toISOString() };
    const inventoryPermission = context === 'material' ? PERMISSIONS.MATERIALS_READ : PERMISSIONS.WASTES_READ;

    // Revalidar identidad y permisos antes de cada aviso, incluidos cambios de rol y bajas.
    // Los fallos de notificación no cambian el resultado de una escritura ya confirmada.
    await Promise.all([...socketInstance.sockets.sockets.values()].map(async socket => {
        try {
            const user = await loadSocketUser(socket);
            if (!user) return socket.disconnect(true);
            if (!socket.connected) return;
            if (hasPermission(user, inventoryPermission)) socket.emit(events.inventory, event);
            if (hasPermission(user, PERMISSIONS.MOVEMENTS_READ)) socket.emit(events.movements, event);
        } catch (err) {
            logger.error({ err }, 'No se pudo enviar la notificación de inventario');
        }
    }));
};
