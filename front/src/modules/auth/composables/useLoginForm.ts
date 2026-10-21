import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useForm } from 'vee-validate';
import { loginValidation } from '@nexus/login-validation';
import { LOGIN_MESSAGES } from '../loginMessages.js';
import { LoginRequestError, loginRequest } from '../services/authService.js';
import type { LoginCredentials, LoginField } from '../login.js';

const REMEMBERED_USER_KEY = 'nexus.rememberedUser';

interface LoginFormOptions {
    onSuccess: () => void;
    request?: typeof loginRequest;
}

export const useLoginForm = ({ onSuccess, request = loginRequest }: LoginFormOptions) => {
    const {
        values,
        errors,
        isSubmitting,
        defineField,
        setFieldValue,
        setFieldError,
        validateField,
        handleSubmit
    } = useForm<LoginCredentials>({
        initialValues: { name: '', password: '' },
        validationSchema: {
            name: (value: unknown) => loginValidation.name(value) || true,
            password: (value: unknown) => loginValidation.password(value) || true,
        },
    });
    const [name] = defineField('name', { validateOnModelUpdate: false });
    const [password] = defineField('password', { validateOnModelUpdate: false });
    const isPasswordVisible = ref(false);
    const shouldRememberUser = ref(false);
    const message = ref('');
    const controller = new AbortController();

    onMounted(() => {
        try {
            localStorage.removeItem('loginRememberedCredentials');
            const rememberedUser = localStorage.getItem(REMEMBERED_USER_KEY);

            if (rememberedUser && loginValidation.name(rememberedUser) === null) {
                setFieldValue('name', rememberedUser, false);
                shouldRememberUser.value = true;
            }
        } catch {
            // Almacenamiento opcional: se continúa sin recordar el usuario.
            shouldRememberUser.value = false;
        }
    });
    onBeforeUnmount(() => controller.abort());

    const updateField = (field: LoginField, value: string) => {
        setFieldValue(field, value, false);
        setFieldError(field, undefined);
        message.value = '';
    };

    const blurField = (field: LoginField) => validateField(field);

    const submitValidated = handleSubmit(async credentials => {
        if (controller.signal.aborted) return;

        message.value = '';

        try {
            await request(credentials, controller.signal);
        } catch (error) {
            if (controller.signal.aborted) return;

            message.value = error instanceof LoginRequestError ? error.message : LOGIN_MESSAGES.REQUEST_FAILED;

            if (error instanceof LoginRequestError) {
                for (const field of ['name', 'password'] as const) {
                    if (error.fieldErrors[field]) setFieldError(field, error.fieldErrors[field]);
                }
            }

            return;
        }

        if (controller.signal.aborted) return;

        // Recordar el usuario es opcional: Express ya confirmó el acceso.
        try {
            if (shouldRememberUser.value) localStorage.setItem(REMEMBERED_USER_KEY, credentials.name.trim());
            else localStorage.removeItem(REMEMBERED_USER_KEY);
        } catch {
            shouldRememberUser.value = false;
        }

        setFieldValue('password', '', false);
        onSuccess();
    }, () => {
        message.value = '';
    });

    const submit = () => {
        if (isSubmitting.value) return;

        return submitValidated();
    };

    return {
        values,
        name,
        password,
        errors,
        isSubmitting,
        isPasswordVisible,
        shouldRememberUser,
        message,
        updateField,
        blurField,
        submit
    };
};
