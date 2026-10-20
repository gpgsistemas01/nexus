<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { useLoginPreview } from '../composables/useLoginPreview.js';
import type { LoginLibrary } from '../loginPreview.js';

const props = defineProps<{ library: LoginLibrary }>();
const candidates = {
  mdb: defineAsyncComponent(() => import('../components/MdbLogin.vue')),
  vuetify: defineAsyncComponent(() => import('../components/VuetifyLogin.vue')),
  primevue: defineAsyncComponent(() => import('../components/PrimeVueLogin.vue')),
};
const candidate = computed(() => candidates[props.library]);
const { form, errors, showPassword, feedback, updateName, updatePassword, togglePassword, submit } = useLoginPreview();
</script>

<template>
  <main class="login-preview">
    <component :is="candidate" :name="form.name" :password="form.password" :errors="errors"
      :show-password="showPassword" :feedback="feedback"
      @name="updateName" @password="updatePassword" @toggle-password="togglePassword" @submit="submit" />
  </main>
</template>

<style>
.login-preview { min-height: 100vh; padding: 26px 18px; display: grid; place-items: start center; background: #f6f7fb; box-sizing: border-box; }
.candidate-card { width: 100%; max-width: 400px; padding: 32px; background: white; color: #17243d; box-sizing: border-box; margin-inline: auto; }
.field-block { margin-bottom: 22px; }
.field-label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 9px; }
.field-error { margin: 7px 0 0; color: #b42332; font-size: 12px; line-height: 1.5; }
.password-toggle { display: block; border: 0; background: none; font: inherit; font-size: 12px; font-weight: 600; color: #57647d; cursor: pointer; padding: 0; margin: 0 0 24px auto; }
.password-toggle:focus-visible { outline: 2px solid #506bc6; outline-offset: 5px; }
.login-feedback { margin: 18px 0 0; padding: 12px; background: #edf8f2; color: #166846; border-radius: 8px; font-size: 13px; line-height: 1.5; }
.preview-caption { text-align: center; margin: 24px 0 0; font-size: 11px; color: #8790a1; }
.login-preview > .v-application { width: 100%; background: transparent; }
@media (max-width: 420px) { .login-preview { padding: 16px 10px; } .candidate-card { padding: 24px 20px; } }
</style>
