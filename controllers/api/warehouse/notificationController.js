import { findLatestNotifications, markAllNotificationsAsRead } from "../../../services/warehouse/notificationService.js";

export const getLatestNotifications = async (req, res) => {

    const { user } = req;
    const { accesses } = user || {};

    if (!accesses || !accesses.length) return res.status(200).json({ items: [], unreadCount: 0 });

    const deparrtments = accesses.map(a => a.department);
    const roles = accesses.map(a => a.role);

    const result = await findLatestNotifications({ take: 15, deparrtments, roles });

    return res.status(200).json(result);
};

export const readAllNotifications = async (req, res) => {

    const { user } = req;
    const { accesses } = user || {};

    if (!accesses || !accesses.length) return res.status(200).json({ message: 'No hay notificaciones para marcar como leídas.' });

    const deparrtments = accesses.map(a => a.department);
    const roles = accesses.map(a => a.role);

    await markAllNotificationsAsRead({ userId: req.userId, deparrtments, roles });

    return res.status(200).json({
        message: 'Notificaciones marcadas como leídas.'
    });
};