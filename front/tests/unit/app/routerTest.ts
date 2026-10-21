import { flushPromises, mount } from '@vue/test-utils';
import { createMemoryHistory } from 'vue-router';
import { describe, expect, it, vi } from 'vitest';
import App from '../../../src/App.vue';
import { createAppRouter } from '../../../src/app/router/index.js';

// La navegación se comprueba sin cargar controles visuales; Playwright usa Vuetify real.
vi.mock('vuetify/components/VApp', () => ({ VApp: { template: '<div><slot /></div>' } }));
vi.mock('../../../src/modules/auth/components/LoginForm.vue', () => ({ default: { template: '<form />' } }));

const openPage = async (path: string) => {
  const router = createAppRouter(createMemoryHistory());
  await router.push(path);
  await router.isReady();
  const page = mount(App, { global: {
    plugins: [router],
    stubs: { VApp: { template: '<div><slot /></div>' }, LoginForm: true },
  } });
  await flushPromises();
  return { router, page };
};

describe('navegación de la aplicación', () => {
  it.each(['/', '/inicio-sesion'])('abre el login al entrar directamente por %s', async path => {
    const { router, page } = await openPage(path);

    expect(router.currentRoute.value.path).toBe('/inicio-sesion');
    expect(page.get('h1').text()).toBe('Iniciar sesión');
  });

  it('conserva el comparador en su ruta explícita', async () => {
    const { page } = await openPage('/inicio');
    expect(page.get('h1').text()).toContain('Un mismo acceso.');
  });

  it('permite recuperar la navegación desde una dirección inexistente', async () => {
    const { router, page } = await openPage('/no-existe');
    expect(page.get('h1').text()).toBe('Página no encontrada');

    await page.get('a').trigger('click');
    await flushPromises();

    expect(router.currentRoute.value.path).toBe('/inicio-sesion');
    expect(page.get('h1').text()).toBe('Iniciar sesión');
  });
});
