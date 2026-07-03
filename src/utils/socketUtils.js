let socketInstance = null;

export const initSocket = (io) => {

    socketInstance = io;
    return socketInstance;
};

export const emitStockUpdated = ({ source = 'unknown', notification = null } = {}) => {

    if (!socketInstance) return;

    socketInstance.emit('stock:updated', {
        source,
        notification,
        updatedAt: new Date().toISOString()
    });
};
