import { ref } from 'vue';
import { useForm } from 'vee-validate';
import { describe, expect, it, vi } from 'vitest';
import { useRecordForm } from '../../../../src/shared/composables/useRecordForm.js';
import { ApiError } from '../../../../src/shared/http/apiError.js';
import { mountComposable } from '../../../helpers/mountComposable.js';

type Values = { name: string; isActive: boolean };
type Result = { id: string };
type NameRule = (value: unknown) => string | true | Promise<string | true>;

const openForm = (
  nameRule: NameRule = (value) => !!String(value).trim() || 'Escribe un nombre.',
) => {
  const isReadOnly = ref(false);
  const saved = vi.fn<(result: Result) => void>();
  const denied = vi.fn();
  const request = vi
    .fn<(values: Values, signal: AbortSignal) => Promise<Result>>()
    .mockResolvedValue({ id: 'registro-1' });
  const mounted = mountComposable(() => {
    const form = useForm<Values>({
      initialValues: { name: '', isActive: true },
      validateOnMount: false,
      validationSchema: { name: nameRule },
    });
    form.defineField('name', { validateOnModelUpdate: false });
    const record = useRecordForm(form, {
      onSaved: saved,
      onDenied: denied,
      isReadOnly: () => isReadOnly.value,
    });
    return {
      ...record,
      values: form.values,
      errors: form.errors,
      submit: record.handleSubmit(request),
    };
  });
  return { ...mounted, request, saved, denied, isReadOnly };
};

describe('ciclo compartido de formularios de registro (DP-VUE-FORM-001)', () => {
  it('abrir y perder foco no muestra errores; capturar o enviar sí valida sin escribir datos inválidos', async () => {
    const { value, request } = openForm();
    await value.blur('name');
    expect(value.errors.value).toEqual({});
    value.update('name', ' ');
    await value.blur('name');
    expect(value.errors.value.name).toBe('Escribe un nombre.');
    await value.submit();
    expect(request).not.toHaveBeenCalled();
    value.update('name', 'Cliente');
    value.update('isActive', false);
    await value.submit();
    expect(request).toHaveBeenCalledWith(
      { name: 'Cliente', isActive: false },
      expect.any(AbortSignal),
    );
  });

  it('no solapa envíos ni permite cambiar la captura pendiente; confirma el resultado recibido', async () => {
    const { value, request, saved } = openForm();
    let finish!: (result: Result) => void;
    request.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    value.update('name', 'Cliente');
    const pending = value.submit();
    await vi.waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    expect(value.isSubmitting.value).toBe(true);
    value.update('name', 'Cambio durante envío');
    await value.submit();
    expect(value.values.name).toBe('Cliente');
    expect(request).toHaveBeenCalledTimes(1);
    const result = { id: 'registro-confirmado' };
    finish(result);
    await pending;
    expect(saved).toHaveBeenCalledWith(result);
    expect(value.isSubmitting.value).toBe(false);
  });

  it('conserva la captura ante un conflicto y bloquea cambios y reenvíos hasta recargar', async () => {
    const { value, request, saved } = openForm();
    request.mockRejectedValueOnce(
      new ApiError('Cambió el registro.', 409, 'RECORD_VERSION_CONFLICT'),
    );
    value.update('name', 'Cliente actualizado');
    await value.submit();
    expect(value.isConflicted.value).toBe(true);
    value.update('name', 'Otra captura');
    await value.submit();
    expect(value.values.name).toBe('Cliente actualizado');
    expect(request).toHaveBeenCalledTimes(1);
    expect(saved).not.toHaveBeenCalled();
  });

  it('un fallo recuperable permite corregir y reintentar sin borrar la captura', async () => {
    const { value, request, saved } = openForm();
    request.mockRejectedValueOnce(
      new ApiError('No se pudo guardar.', 400, 'VALIDATION_ERROR', {
        name: 'Nombre duplicado.',
      }),
    );
    value.update('name', 'Cliente');
    await value.submit();
    expect(value.errors.value.name).toBe('Nombre duplicado.');
    expect(saved).not.toHaveBeenCalled();
    value.update('name', 'Otro cliente');
    expect(value.message.value).toBe('');
    expect(value.errors.value.name).toBeUndefined();
    await value.submit();
    expect(saved).toHaveBeenCalledTimes(1);
  });

  it('el modo de consulta impide editar y enviar hasta habilitar el formulario', async () => {
    const { value, request, isReadOnly } = openForm();
    isReadOnly.value = true;
    value.update('name', 'No permitido');
    await value.submit();
    expect(value.values.name).toBe('');
    expect(value.errors.value).toEqual({});
    expect(request).not.toHaveBeenCalled();
    isReadOnly.value = false;
    value.update('name', 'Permitido');
    await value.submit();
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('desmontar durante una validación asíncrona impide guardar y confirmar después', async () => {
    let finish!: (result: true) => void;
    const validation = new Promise<true>((resolve) => {
      finish = resolve;
    });
    const { value, request, saved, wrapper } = openForm(() => validation);
    value.update('name', 'Cliente');
    const pending = value.submit();
    expect(value.isSubmitting.value).toBe(true);
    await value.submit();
    wrapper.unmount();
    finish(true);
    await pending;
    await value.submit();
    expect(request).not.toHaveBeenCalled();
    expect(saved).not.toHaveBeenCalled();
  });
});
