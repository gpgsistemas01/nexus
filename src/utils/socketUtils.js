let socketInstance = null;

export const initSocket = (io) => {

    socketInstance = io;
    return socketInstance;
};

export const emitMaterialsUpdated = ({ source = 'unknown' } = {}) => {

    if (!socketInstance) return;

    socketInstance.emit('materials:updated', {
        source,
        updatedAt: new Date().toISOString()
    });
};

export const emitNotificationCreated = ({ notification } = {}) => {

    if (!socketInstance || !notification) return;

    socketInstance.emit('notification:created', { notification });
};
