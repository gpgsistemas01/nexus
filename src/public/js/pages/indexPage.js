import { notifications } from "../plugins/swal/swalComponent.js";
import { handleFlashMessage } from "../handlers/flashMessageHandler.js";
import { getLatestNotificationsRequest, markAllNotificationsAsReadRequest } from "../services/warehouse/notificationService.js";
import { formatNotificationDate } from "../utils/formatters.js";

handleFlashMessage(window.FLASH_MESSAGE || null);

const successMessage = localStorage.getItem('showSuccessToast');
const errorMessage = localStorage.getItem('showErrorToast');

if (successMessage) {
    
    notifications.showSuccess(successMessage);
    localStorage.removeItem('showSuccessToast');
}

if (errorMessage) {
    
    notifications.showError(errorMessage);
    localStorage.removeItem('showErrorToast');
}

document.querySelectorAll('.dropdown').forEach(dropdown => {
    const btn = dropdown.querySelector('button[data-mdb-dropdown-init]');
    const instance = mdb.Dropdown.getOrCreateInstance(btn);
    dropdown.addEventListener('mouseenter', () => {
        instance.show();
    });
    dropdown.addEventListener('mouseleave', () => {
        instance.hide();
        btn.blur();
    });
});

const notificationsBellBtn = document.getElementById('notificationsBellBtn');
const notificationsList = document.getElementById('notificationsList');
const notificationsUnreadCount = document.getElementById('notificationsUnreadCount');
const markNotificationsReadBtn = document.getElementById('markNotificationsReadBtn');
const appContext = window.APP_CONTEXT || {};
const loggedUserRole = appContext.role || '';
const loggedUserDepartment = appContext.department || '';
const loggedUserDepartmentId = appContext.departmentId || '';
const isSystemAdmin = loggedUserRole === 'Administrador del sistema';
const isWarehouse = loggedUserDepartment === 'Almacén';

const shouldDisplayRealtimeNotification = (notification) => {

    if (!notification) return false;

    const { entityType, departmentId } = notification;

    if (entityType === 'product-stock-restored') return false;

    if (isSystemAdmin) return true;

    if (isWarehouse) return entityType === 'product-low-stock';

    if (entityType === 'product-low-stock') return true;

    return departmentId === loggedUserDepartmentId;
};

const updateUnreadCount = (count) => {

    if (!notificationsUnreadCount) return;

    notificationsUnreadCount.textContent = count;
    notificationsUnreadCount.classList.toggle('d-none', count <= 0);
};

const renderNotifications = (items = []) => {

    if (!notificationsList) return;

    if (!items.length) {
        notificationsList.innerHTML = '<li class="px-3 py-3 text-center text-white-50">Sin notificaciones</li>';
        return;
    }

    notificationsList.innerHTML = items.map((item) => `
        <li class="list-group-item bg-transparent border-0 border-bottom border-secondary-subtle notification-item">
            <div class="fw-bold">${item.title}</div>
            <div class="small">${item.message}</div>
            <small>${formatNotificationDate(item.createdAt)}</small>
        </li>
    `).join('');
};

const loadNotifications = async () => {

    if (!notificationsBellBtn) return;

    try {
        const response = await getLatestNotificationsRequest();
        const { items, unreadCount } = response.data;

        renderNotifications(items);
        updateUnreadCount(unreadCount);
    } catch (err) {
        console.error(err);
    }
};

if (markNotificationsReadBtn) {
    markNotificationsReadBtn.addEventListener('click', async () => {
        try {
            await markAllNotificationsAsReadRequest();
            updateUnreadCount(0);
        } catch (err) {
            notifications.showError('No se pudieron marcar las notificaciones como leídas.');
        }
    });
}

if (notificationsBellBtn) {
    loadNotifications();

    if (typeof window.io === 'function') {
        const socket = window.io();

        socket.on('stock:updated', async (data) => {

            const { notification } = data;
            window.dispatchEvent(new CustomEvent('stock:updated', { detail: { notification } }));

            if (shouldDisplayRealtimeNotification(notification)) {
                notifications.showWarning(notification.message);
            }

            await loadNotifications();
        });
    }
}
