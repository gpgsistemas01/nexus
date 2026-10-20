import { flushPromises, mount } from '@vue/test-utils';
import { createMemoryHistory } from 'vue-router';
import { describe, expect, it } from 'vitest';
import App from '../../../src/App.vue';
import { createAppRouter } from '../../../src/app/router/index.js';

const openPage = async (path: string) => {
  const router = createAppRouter(createMemoryHistory());
  await router.push(path);
  await router.isReady();
  const page = mount(App, { global: { plugins: [router] } });
  await flushPromises();
  return { router, page };
};

describe('navegación de la aplicación', () => {
  it.each(['/', '/inicio'])('abre la bienvenida al entrar directamente por %s', async path => {
    const { router, page } = await openPage(path);

    expect(router.currentRoute.value.path).toBe('/inicio');
    expect(page.get('h1').text()).toContain('Un mismo acceso.');
  });

  it('permite recuperar la navegación desde una dirección inexistente', async () => {
    const { router, page } = await openPage('/no-existe');
    expect(page.get('h1').text()).toBe('Página no encontrada');

    await page.get('a').trigger('click');
    await flushPromises();

    expect(router.currentRoute.value.path).toBe('/inicio');
    expect(page.get('h1').text()).toContain('Un mismo acceso.');
  });
});
