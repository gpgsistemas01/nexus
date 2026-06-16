import { login } from "../../application/auth/login.js";
import { useForm } from "../../application/form.js";
import { validateFields } from "../../utils/formUtils.js";
import { loginValidators } from "../../utils/validations/validators.js";
import { FORM_SELECTORS } from "../../constants/selectors.js";

const formId = FORM_SELECTORS.LOGIN;
const rememberCredentialsKey = 'loginRememberedCredentials';
const loginForm = document.querySelector(formId);
const nameInput = loginForm?.querySelector('[name="name"]');
const passwordInput = loginForm?.querySelector('[name="password"]');
const rememberCredentialsInput = loginForm?.querySelector('[name="rememberCredentials"]');

const getRememberedCredentials = () => {

    const credentials = localStorage.getItem(rememberCredentialsKey);

    if (!credentials) return null;

    try {

        return JSON.parse(credentials);

    } catch {

        localStorage.removeItem(rememberCredentialsKey);
        return null;
    }
};

const loadRememberedCredentials = () => {

    const credentials = getRememberedCredentials();

    if (!credentials) return;

    if (nameInput) nameInput.value = credentials.name || '';
    if (passwordInput) passwordInput.value = credentials.password || '';
    if (rememberCredentialsInput) rememberCredentialsInput.checked = true;
};

const updateRememberedCredentials = (formData) => {

    if (formData.rememberCredentials !== 'true') {

        localStorage.removeItem(rememberCredentialsKey);
        return;
    }

    localStorage.setItem(rememberCredentialsKey, JSON.stringify({
        name: formData.name,
        password: formData.password
    }));
};

document.getElementById('submitBtn').textContent = 'Ingresar';
loadRememberedCredentials();

useForm({
    selector: formId,
    normalizeData: ({ formData }) => formData,
    getErrors: ({ formData }) => validateFields(loginValidators, formData),
    normalizeErrors: ({ errors }) => {

        errors.name = errors.name ? 'Usuario incorrecto' : null;
        errors.password = errors.password ? 'Contraseña incorrecta' : null;

        return errors;
    },
    sendRequest: async ({ formData }) => {

        const response = await login({ formData });

        updateRememberedCredentials(formData);
        localStorage.setItem('showSuccessToast', response.message);
        window.location.replace('/productos');
    }
});
