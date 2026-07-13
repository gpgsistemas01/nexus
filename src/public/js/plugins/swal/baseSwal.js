const toastClassByIcon = {
    success: 'swal2-toast-success',
    warning: 'swal2-toast-warning',
    error: 'swal2-toast-error',
    info: 'swal2-toast-info'
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
    confirmButtonColor = '#0d6efd'
}) => Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor
});
