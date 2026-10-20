<script setup lang="ts">
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import LoginHeading from './LoginHeading.vue';
import type { LoginPreviewEmits, LoginPreviewProps } from '../loginPreview.js';

defineProps<LoginPreviewProps>();
const emit = defineEmits<LoginPreviewEmits>();
</script>

<template>
  <section class="candidate-card prime-card" aria-label="Inicio de sesión con PrimeVue">
    <LoginHeading />
    <form novalidate @submit.prevent="emit('submit')">
      <div class="field-block">
        <label for="prime-name" class="field-label">Nombre de usuario</label>
        <InputText id="prime-name" name="name" autocomplete="username" placeholder="Tu nombre de usuario"
          :model-value="name" :invalid="Boolean(errors.name)" aria-describedby="prime-name-error"
          @update:model-value="emit('name', $event ?? '')" />
        <p v-if="errors.name" id="prime-name-error" class="field-error" role="alert">{{ errors.name }}</p>
      </div>
      <div class="field-block">
        <label for="prime-password" class="field-label">Contraseña</label>
        <InputText id="prime-password" name="password" autocomplete="current-password" placeholder="Tu contraseña"
          :type="showPassword ? 'text' : 'password'" :model-value="password"
          :invalid="Boolean(errors.password)" aria-describedby="prime-password-error"
          @update:model-value="emit('password', $event ?? '')" />
        <p v-if="errors.password" id="prime-password-error" class="field-error" role="alert">{{ errors.password }}</p>
      </div>
      <button type="button" class="password-toggle" :aria-pressed="showPassword" @click="emit('togglePassword')">
        {{ showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña' }}
      </button>
      <Button label="Ingresar" type="submit" class="login-submit" />
      <p v-if="feedback" class="login-feedback" role="status">{{ feedback }}</p>
    </form>
    <p class="preview-caption">Vista de prueba · sin conexión al servidor</p>
  </section>
</template>

<style scoped>
.prime-card { border: 1px solid #e1e8e5; border-radius: 12px; }
:deep(.p-inputtext), .login-submit { width: 100%; }
</style>
