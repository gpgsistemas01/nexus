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