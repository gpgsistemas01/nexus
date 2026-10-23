import Swal from 'sweetalert2';
// La entrada raíz ya incluye los estilos base de SweetAlert2.
import './feedback.css';

const dialog = Swal.mixin({
    customClass: {
        popup: 'nexus-feedback v-theme--warehouse',
        container: 'nexus-feedback-container',
        confirmButton: 'feedback-confirm',
        cancelButton: 'feedback-cancel',
    },
    buttonsStyling: false,
    reverseButtons: true,
});

export const showSuccess = (message: string) =>
    dialog.fire({
        titleText: message,
        icon: 'success',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3500,
        timerProgressBar: true,
    });

export const confirmRemoval = async (options: {
    title: string;
    description: string;
    signal: AbortSignal;
    submit: () => Promise<void>;
    confirmLabel?: string;
    failureMessage?: string;
}) => {
    if (options.signal.aborted) return false;

    let popup: HTMLElement | undefined;

    const close = () => {
        if (popup && Swal.getPopup() === popup) Swal.close();
    };

    options.signal.addEventListener('abort', close, { once: true });

    try {
        const result = await dialog.fire({
            titleText: options.title,
            text: options.description,
            icon: 'warning',
            showCancelButton: true,
            cancelButtonText: 'Cancelar',
            focusCancel: true,
            confirmButtonText: options.confirmLabel ?? 'Confirmar eliminación',
            showLoaderOnConfirm: true,
            allowOutsideClick: () => !Swal.isLoading(),
            allowEscapeKey: () => !Swal.isLoading(),
            willOpen: (element) => {
                popup = element;
            },
            preConfirm: async () => {
                try {
                    await options.submit();
                    return !options.signal.aborted;
                } catch (cause) {
                    if (options.signal.aborted) return false;

                    // `text` evita interpretar como HTML nombres o mensajes recibidos.
                    Swal.update({
                        text:
                            cause instanceof Error
                                ? cause.message
                                : 'No se pudo eliminar el registro.',
                    });
                    Swal.showValidationMessage(
                        options.failureMessage ??
                            'La eliminación no se confirmó. Puedes reintentar o cancelar.',
                    );
                    return false;
                }
            },
        });
        return result.isConfirmed && result.value === true && !options.signal.aborted;
    } finally {
        options.signal.removeEventListener('abort', close);
    }
};
