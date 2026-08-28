const toastClassByIcon = {
    success: 'swal2-toast-success',
    warning: 'swal2-toast-warning',
    error: 'swal2-toast-error',
    info: 'swal2-toast-info'
};

const confirmationClassByVariant = {
    primary: 'swal2-confirmation-primary',
    danger: 'swal2-confirmation-danger',
    warning: 'swal2-confirmation-warning'
};

const getModalClasses = (variant = 'primary', popupClass = '') => ({
    popup: [
        'swal2-app-modal',
        confirmationClassByVariant[variant] ?? confirmationClassByVariant.primary,
        popupClass
    ].filter(Boolean).join(' '),
    title: 'swal2-app-modal-title',
    htmlContainer: 'swal2-app-modal-content',
    confirmButton: 'swal2-app-modal-confirm-button',
    cancelButton: 'swal2-app-modal-cancel-button'
});

export const showToast = ({ 
    title, 
    text = null, 
    icon = 'info' 
}) => {

    Swal.fire({
        toast: true,
        position: 'top-end',
        title,
        text,
        icon,
        customClass: {
            popup: toastClassByIcon[icon] ?? toastClassByIcon.info
        },
        showConfirmButton: false,
        timer: 3000
    });
};

export const showModal = ({ 
    title = 'Error del servidor', 
    text = 'No se pudo conectar al servidor.', 
    icon = 'error' 
} = {}) => {

    return Swal.fire({
        title,
        text,
        icon,
        confirmButtonText: 'Aceptar',
        buttonsStyling: false,
        customClass: getModalClasses(icon === 'error' ? 'danger' : icon === 'warning' ? 'warning' : 'primary')
    });
};

export const showDialog = ({
    variant = 'primary',
    popupClass = '',
    showCancelButton = true,
    reverseButtons = true,
    confirmButtonText = 'Confirmar',
    cancelButtonText = 'Cancelar',
    ...options
}) => Swal.fire({
    ...options,
    showCancelButton,
    reverseButtons,
    confirmButtonText,
    cancelButtonText,
    buttonsStyling: false,
    customClass: getModalClasses(variant, popupClass)
});

export const showConfirmation = ({
    title,
    text,
    icon = 'warning',
    confirmButtonText = 'Confirmar',
    cancelButtonText = 'Cancelar',
    variant = 'primary'
}) => showDialog({
    title,
    text,
    icon,
    showCancelButton: true,
    reverseButtons: true,
    confirmButtonText,
    cancelButtonText,
    variant
});
