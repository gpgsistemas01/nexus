import { WASTE_OPERATION_ACTIONS } from '../../constants/inventory.js';
import { BUTTON_SELECTORS } from '../../constants/selectors.js';
import { notifications } from '../../plugins/swal/swalComponent.js';

const storageKey = ({ action, id = '' }) => `nexus:waste-operation:${window.meta.id}:${action}:${id}`;

export const getPendingWasteOperation = options => {
    const saved = localStorage.getItem(storageKey(options));
    return saved ? JSON.parse(saved) : null;
};

export const showPendingWasteOperation = ({ form, ...options }) => {
    form.querySelector('[data-pending-waste-operation]')?.remove();
    if (!getPendingWasteOperation(options)) return;
    const notice = document.createElement('p');
    notice.dataset.pendingWasteOperation = '';
    notice.setAttribute('role', 'status');
    notice.textContent = 'Hay una captura pendiente de confirmar. Pulse Recuperar: se enviará la captura anterior, sin los cambios nuevos del formulario.';
    form.querySelector(BUTTON_SELECTORS.SUBMIT).before(notice);
    form.querySelector(BUTTON_SELECTORS.SUBMIT).textContent = 'Recuperar';
};

export const submitWasteOperation = async ({ action, id = '', form, formData, submit }) => {
    const options = { action, id };
    const pending = getPendingWasteOperation(options);
    if (pending) {
        const { isConfirmed } = await notifications.showConfirmation({
            title: 'Recuperar captura pendiente',
            text: `Se consultará la captura anterior de ${pending.name || 'esta merma'}, cantidad ${pending.initialQuantity ?? pending.quantity}. Si ya se guardó, se recuperará el mismo registro.`,
            confirmButtonText: 'Recuperar'
        });
        if (!isConfirmed) return;
    }

    const data = pending || { ...formData, operationId: crypto.randomUUID() };
    // Guardar antes de enviar permite recuperar después de timeout, cierre o recarga.
    // Si el almacenamiento no está disponible, se cancela antes de escribir en el servidor.
    localStorage.setItem(storageKey(options), JSON.stringify(data));
    try {
        const result = await submit(data);
        localStorage.removeItem(storageKey(options));
        return result;
    } catch (err) {
        const status = err.status;
        // Un rechazo definitivo del primer intento no creó efectos. Un reintento
        // sin permiso puede corresponder a una captura ya confirmada y se conserva.
        if ((!pending && status >= 400 && status < 500 && err.data?.code !== 'OPERATION_KEY_CONFLICT') || err.data?.meta?.operationRejected === true) {
            localStorage.removeItem(storageKey(options));
            if (form) {
                form.querySelector('[data-pending-waste-operation]')?.remove();
                form.querySelector(BUTTON_SELECTORS.SUBMIT).textContent = action === WASTE_OPERATION_ACTIONS.CREATE ? 'Guardar' : 'Agregar';
            }
        }
        if (form && getPendingWasteOperation(options)) showPendingWasteOperation({ form, ...options });
        throw err;
    }
};
