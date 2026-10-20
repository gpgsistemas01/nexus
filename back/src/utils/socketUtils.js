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

export const initSocket = (io) => {

    socketInstance = io;
    return socketInstance;
};

export const emitInventoryUpdated = ({ context, source = 'unknown' }) => {

    if (!socketInstance) return;

    const events = INVENTORY_UPDATE_EVENTS[context];
    if (!events) return;

    const event = {
        context,
        source,
        updatedAt: new Date().toISOString()
    };

    socketInstance.emit(events.inventory, event);
    socketInstance.emit(events.movements, event);
};
