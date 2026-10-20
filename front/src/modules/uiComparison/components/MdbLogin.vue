<script setup lang="ts">
import { MDBBtn, MDBInput } from 'mdb-vue-ui-kit';
import 'mdb-vue-ui-kit/css/mdb.min.css';
import LoginHeading from './LoginHeading.vue';
import type { LoginPreviewEmits, LoginPreviewProps } from '../loginPreview.js';

defineProps<LoginPreviewProps>();
const emit = defineEmits<LoginPreviewEmits>();
</script>

<template>
  <section class="candidate-card mdb-card" aria-label="Inicio de sesión con MDB Vue">
    <LoginHeading />
    <form novalidate @submit.prevent="emit('submit')">
      <div class="field-block">
        <MDBInput id="mdb-name" name="name" label="Nombre de usuario" autocomplete="username"
          :model-value="name" :aria-invalid="Boolean(errors.name)" aria-describedby="mdb-name-error"
          @update:model-value="emit('name', String($event ?? ''))" />
        <p v-if="errors.name" id="mdb-name-error" class="field-error" role="alert">{{ errors.name }}</p>
      </div>
      <div class="field-block">
        <MDBInput id="mdb-password" name="password" label="Contraseña" autocomplete="current-password"
          :type="showPassword ? 'text' : 'password'" :model-value="password"
          :aria-invalid="Boolean(errors.password)" aria-describedby="mdb-password-error"
          @update:model-value="emit('password', String($event ?? ''))" />
        <p v-if="errors.password" id="mdb-password-error" class="field-error" role="alert">{{ errors.password }}</p>
      </div>
      <button type="button" class="password-toggle" :aria-pressed="showPassword" @click="emit('togglePassword')">
        {{ showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña' }}
      </button>
      <MDBBtn color="primary" type="submit" class="login-submit">Ingresar</MDBBtn>
      <p v-if="feedback" class="login-feedback" role="status">{{ feedback }}</p>
    </form>
    <p class="preview-caption">Vista de prueba · sin conexión al servidor</p>
  </section>
</template>

<style scoped>
.mdb-card { box-shadow: 0 8px 32px #17243d0d; border-radius: 14px; }
.login-submit { width: 100%; padding: 13px; letter-spacing: .06em; }
</style>
