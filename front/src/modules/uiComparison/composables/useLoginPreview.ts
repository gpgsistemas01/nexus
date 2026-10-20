import { reactive, ref } from 'vue';

// Esta demostración sólo compara la captura: no autentica ni persiste credenciales.
export const useLoginPreview = () => {
  const form = reactive({ name: '', password: '' });
  const errors = reactive({ name: '', password: '' });
  const showPassword = ref(false);
  const feedback = ref('');

  const updateName = (value: string) => {
    form.name = value;
    errors.name = '';
    feedback.value = '';
  };
  const updatePassword = (value: string) => {
    form.password = value;
    errors.password = '';
    feedback.value = '';
  };
  const togglePassword = () => { showPassword.value = !showPassword.value; };
  const submit = () => {
    errors.name = form.name.trim() ? '' : 'Escribe tu nombre de usuario.';
    errors.password = form.password ? '' : 'Escribe tu contraseña.';
    feedback.value = errors.name || errors.password
      ? ''
      : 'Datos completos. Esta demostración no inicia sesión.';
  };

  return { form, errors, showPassword, feedback, updateName, updatePassword, togglePassword, submit };
};
