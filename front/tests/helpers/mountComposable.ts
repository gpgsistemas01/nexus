import { defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';
export const mountComposable = <T>(create: () => T) => {
  let value!: T;
  const wrapper = mount(
    defineComponent({
      setup() {
        value = create();
        return () => h('div');
      },
    }),
  );
  return { value, wrapper };
};
