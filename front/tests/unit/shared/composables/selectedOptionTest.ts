import { nextTick, ref, shallowRef } from 'vue';
import { expect, it } from 'vitest';
import { useSelectedOption } from '../../../../src/shared/composables/useSelectedOption.js';
import type { LookupItem } from '../../../../src/shared/lookup.js';
import { mountComposable } from '../../../helpers/mountComposable.js';

it('precarga la selección, adopta los datos remotos y los conserva al cambiar de página', async () => {
  const id = ref('proveedor');
  const items = ref<LookupItem[]>([]);
  const initial = { id: id.value, title: 'Nombre del documento', data: {} };
  const { value } = mountComposable(() =>
    useSelectedOption(
      items,
      () => id.value,
      () => initial,
    ),
  );
  expect(value.value).toEqual(initial);
  const current = {
    ...initial,
    title: 'Nombre actualizado',
    data: { version: 2 },
    isDisabled: true,
  };
  items.value = [current];
  await nextTick();
  expect(value.value).toEqual(current);
  items.value = [];
  await nextTick();
  expect(value.value).toEqual(current);
});

it('cambiar o limpiar el ID descarta la etiqueta anterior y no adopta una precarga ajena', async () => {
  const id = ref('primero');
  const initial = { id: id.value, title: 'Primero', data: {} };
  const { value } = mountComposable(() =>
    useSelectedOption(
      ref([]),
      () => id.value,
      () => initial,
    ),
  );
  id.value = 'segundo';
  await nextTick();
  expect(value.value).toBeUndefined();
  const created = { id: id.value, title: 'Segundo confirmado', data: {} };
  value.value = created;
  await nextTick();
  expect(value.value).toEqual(created);
  id.value = '';
  await nextTick();
  expect(value.value).toBeUndefined();
});

it('recibe una precarga tardía sin compartir la selección con otro formulario', async () => {
  const initial = shallowRef<LookupItem>();
  const items = ref<LookupItem[]>([]);
  const { value } = mountComposable(() =>
    useSelectedOption(
      items,
      () => 'cliente',
      () => initial.value,
    ),
  );
  const other = mountComposable(() => useSelectedOption(items, () => 'cliente')).value;
  expect(value.value).toBeUndefined();
  initial.value = { id: 'cliente', title: 'Cliente confirmado', data: {} };
  await nextTick();
  expect(value.value).toEqual(initial.value);
  expect(other.value).toBeUndefined();
});
