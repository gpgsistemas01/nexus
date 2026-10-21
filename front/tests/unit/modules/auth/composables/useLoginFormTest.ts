import { defineComponent, h } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLoginForm } from '../../../../../src/modules/auth/composables/useLoginForm.js';
import { LoginRequestError } from '../../../../../src/modules/auth/services/authService.js';
import type { loginRequest } from '../../../../../src/modules/auth/services/authService.js';

const openForm = (request = vi.fn<typeof loginRequest>().mockResolvedValue(), onSuccess = vi.fn()) => {
  let form!: ReturnType<typeof useLoginForm>;
  const page = mount(defineComponent({ setup() {
    form = useLoginForm({ onSuccess, request });
    return () => h('div');
  } }));
  return { form, request, onSuccess, page };
};

beforeEach(() => localStorage.clear());
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('login Vue: captura y transición de acceso (DP-VAL-002)', () => {
  it('abre la captura sin mostrar errores antes de interactuar y elimina credenciales antiguas', async () => {
    localStorage.setItem('loginRememberedCredentials', JSON.stringify({ name: 'usuario', password: 'antigua' }));
    const { form } = openForm();
    await flushPromises();
    expect(form.errors.value).toEqual({});
    expect(form.values).toEqual({ name: '', password: '' });
    expect(localStorage.getItem('loginRememberedCredentials')).toBeNull();
  });
  it('rechaza campos vacíos antes de llamar al servidor', async () => {
    const { form, request } = openForm();
    await form.submit();
    expect(form.errors.value.name).toBeTruthy();
    expect(form.errors.value.password).toBeTruthy();
    expect(request).not.toHaveBeenCalled();
  });

  it.each([
    ['usuario de 50 caracteres', 'name', 'u'.repeat(50), true],
    ['usuario de 51 caracteres', 'name', 'u'.repeat(51), false],
    ['usuario de 50 caracteres Unicode', 'name', '😀'.repeat(50), true],
    ['usuario de 51 caracteres Unicode', 'name', '😀'.repeat(51), false],
    ['contraseña de 50 caracteres', 'password', 'p'.repeat(50), true],
    ['contraseña de 51 caracteres', 'password', 'p'.repeat(51), false],
    ['contraseña histórica corta', 'password', 'abc', true],
    ['contraseña de espacios', 'password', '   ', false],
  ] as const)('valida %s antes de enviar', async (_case, field, value, valid) => {
    const { form, request } = openForm();
    form.updateField('name', 'usuario');
    form.updateField('password', 'legado');
    form.updateField(field, value);

    await form.submit();

    expect(request.mock.calls.length).toBe(valid ? 1 : 0);
    expect(Boolean(form.errors.value[field])).toBe(!valid);
  });

  it('un rechazo mantiene el formulario, muestra errores y permite corregir y reintentar', async () => {
    const request = vi.fn<typeof loginRequest>()
      .mockRejectedValueOnce(new LoginRequestError('Revisa los datos de acceso.', { name: 'Nombre inválido.' }))
      .mockResolvedValueOnce();
    const { form, onSuccess } = openForm(request);
    form.updateField('name', 'usuario');
    form.updateField('password', ' legado ');
    await form.submit();
    expect(form.errors.value.name).toBe('Nombre inválido.');
    expect(form.isSubmitting.value).toBe(false);
    expect(onSuccess).not.toHaveBeenCalled();
    form.updateField('name', 'usuario.correcto');
    expect(form.errors.value.name).toBeUndefined();
    expect(form.message.value).toBe('');
    await form.submit();
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(form.values.password).toBe('');
  });

  it('evita envíos simultáneos y sólo recuerda el usuario después de un acceso válido', async () => {
    let finish!: () => void;
    const request = vi.fn<typeof loginRequest>(() => new Promise<void>(resolve => { finish = resolve; }));
    const { form, onSuccess } = openForm(request);
    form.updateField('name', ' usuario ');
    form.updateField('password', ' legado ');
    form.shouldRememberUser.value = true;
    const pending = form.submit();
    await flushPromises();
    await vi.waitFor(() => expect(request).toHaveBeenCalledOnce());
    expect(form.isSubmitting.value).toBe(true);
    await form.submit();
    expect(request).toHaveBeenCalledOnce();
    expect(localStorage.length).toBe(0);
    finish();
    await pending;
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(localStorage.getItem('nexus.rememberedUser')).toBe('usuario');
    expect(localStorage.length).toBe(1);
    const next = openForm();
    expect(next.form.values.name).toBe('usuario');
    expect(next.form.values.password).toBe('');
    next.form.shouldRememberUser.value = false;
    next.form.updateField('password', 'abc');
    await next.form.submit();
    expect(localStorage.length).toBe(0);
  });

  it('el bloqueo de almacenamiento no impide iniciar sesión', async () => {
    const { form, onSuccess } = openForm();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => { throw new Error('Bloqueado'); });
    form.updateField('name', 'usuario');
    form.updateField('password', 'abc');
    form.shouldRememberUser.value = true;
    await form.submit();
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it('cancela el envío al desmontar y descarta una respuesta tardía', async () => {
    let finish!: () => void;
    const request = vi.fn<typeof loginRequest>(() => new Promise<void>(resolve => { finish = resolve; }));
    const { form, onSuccess, page } = openForm(request);
    form.updateField('name', 'usuario');
    form.updateField('password', 'legado');
    form.shouldRememberUser.value = true;
    const pending = form.submit();
    await vi.waitFor(() => expect(request).toHaveBeenCalledOnce());

    page.unmount();
    finish();
    await pending;

    expect(request.mock.calls[0]![1]?.aborted).toBe(true);
    expect(onSuccess).not.toHaveBeenCalled();
    expect(localStorage.length).toBe(0);
  });

  it('no presenta un fallo de navegación como rechazo de un acceso confirmado', async () => {
    const onSuccess = vi.fn(() => { throw new Error('Navegación bloqueada'); });
    const { form, request } = openForm(undefined, onSuccess);
    form.updateField('name', 'usuario');
    form.updateField('password', 'legado');

    await expect(form.submit()).rejects.toThrow('Navegación bloqueada');

    expect(request).toHaveBeenCalledOnce();
    expect(form.message.value).toBe('');
    expect(form.values.password).toBe('');
  });
});
