import { readonly, ref } from 'vue';

export const useWelcomeCounter = () => {
  const count = ref(0);

  const increment = () => {
    count.value += 1;
  };

  return { count: readonly(count), increment };
};
