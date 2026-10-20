import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import WelcomePage from '../../../../src/modules/welcome/pages/WelcomePage.vue';

describe('estado visible de la pantalla de bienvenida', () => {
  it('incrementa el contador desde la acción del usuario y reinicia una instancia nueva', async () => {
    const page = mount(WelcomePage);
    const button = page.get('button');

    expect(button.text()).toBe('Count is 0');
    await button.trigger('click');
    await button.trigger('click');
    expect(button.text()).toBe('Count is 2');

    page.unmount();
    const reopenedPage = mount(WelcomePage);
    expect(reopenedPage.get('button').text()).toBe('Count is 0');
  });
});
