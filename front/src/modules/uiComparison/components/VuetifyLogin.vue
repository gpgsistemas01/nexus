<script setup lang="ts">
import { VApp, VBtn, VTextField } from 'vuetify/components';
import LoginHeading from './LoginHeading.vue';
import type { LoginPreviewEmits, LoginPreviewProps } from '../loginPreview.js';

defineProps<LoginPreviewProps>();
const emit = defineEmits<LoginPreviewEmits>();
</script>

<template>
  <VApp>
    <section class="candidate-card vuetify-card" aria-label="Inicio de sesión con Vuetify">
      <LoginHeading />
      <form novalidate @submit.prevent="emit('submit')">
        <VTextField id="vuetify-name" name="name" label="Nombre de usuario" autocomplete="username"
          :model-value="name" :error-messages="errors.name" variant="filled" color="primary"
          @update:model-value="emit('name', $event ?? '')" />
        <VTextField id="vuetify-password" name="password" label="Contraseña" autocomplete="current-password"
          :type="showPassword ? 'text' : 'password'" :model-value="password"
          :error-messages="errors.password" variant="filled" color="primary"
          @update:model-value="emit('password', $event ?? '')" />
        <button type="button" class="password-toggle" :aria-pressed="showPassword" @click="emit('togglePassword')">
          {{ showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña' }}
        </button>
        <VBtn color="primary" type="submit" block rounded="pill" size="large" elevation="0">Ingresar</VBtn>
        <p v-if="feedback" class="login-feedback" role="status">{{ feedback }}</p>
      </form>
      <p class="preview-caption">Vista de prueba · sin conexión al servidor</p>
    </section>
  </VApp>
</template>

<style scoped>
.vuetify-card { border-radius: 24px; border: 1px solid #e8e4ef; }
:deep(.v-application) { background: transparent; }
:deep(.v-application__wrap) { min-height: auto; }
</style>
