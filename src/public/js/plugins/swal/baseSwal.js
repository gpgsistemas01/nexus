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
}

export const showModal = ({ 
    title = 'Error del servidor', 
    text = 'No se pudo conectar al servidor.', 
    icon = 'error' 
} = {}) => {

    Swal.fire({
        title,
        text,
        icon,
        confirmButtonText: 'Aceptar'
    });
}

export const showConfirmation = ({
    title,
    text,
    icon = 'warning',
    confirmButtonText = 'Confirmar',
    cancelButtonText = 'Cancelar',
    variant = 'primary'
}) => Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    buttonsStyling: false,
    customClass: {
        popup: `swal2-confirmation-modal ${confirmationClassByVariant[variant] ?? confirmationClassByVariant.primary}`,
        title: 'swal2-confirmation-title',
        htmlContainer: 'swal2-confirmation-content',
        confirmButton: 'swal2-confirmation-confirm-button',
        cancelButton: 'swal2-confirmation-cancel-button'
    }
});
