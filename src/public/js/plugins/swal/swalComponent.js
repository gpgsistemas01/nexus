import { showModal, showToast } from "./baseSwal.js";

export const notifications = {
    showSuccess: (title) => showToast({ title, icon: 'success' }),
    showWarning: (title) => showToast({ title, icon: 'warning' }),
    showError: (title) => showToast({ title, icon: 'error' }),
    showInfo: (title) => showToast({ title }),
    showModal: ({ title, text, icon = 'info' }) => showModal({ title, text, icon })
}