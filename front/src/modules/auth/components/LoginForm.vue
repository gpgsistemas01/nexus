<script setup lang="ts">
import { VBtn } from 'vuetify/components/VBtn';
import { VCheckbox } from 'vuetify/components/VCheckbox';
import { VTextField } from 'vuetify/components/VTextField';
import type { LoginFormEmits, LoginFormProps } from '../login.js';

defineProps<LoginFormProps>();
const emit = defineEmits<LoginFormEmits>();
</script>

<template>
    <form
        class="login-form"
        novalidate
        :aria-busy="isSubmitting"
        @submit.prevent="emit('submit')"
    >
        <label
            id="login-name-label"
            class="login-label"
            for="login-name"
        >
            Nombre de usuario
        </label>
        <VTextField
            id="login-name"
            name="name"
            autocomplete="username"
            placeholder="Ingresa tu usuario"
            aria-label="Nombre de usuario"
            :aria-invalid="!!errors.name"
            :model-value="name"
            :error-messages="errors.name"
            :disabled="isSubmitting"
            variant="solo"
            flat
            rounded="lg"
            bg-color="#f6faf7"
            color="primary"
            base-color="#332d2d"
            @update:model-value="emit('update:name', $event ?? '')"
            @blur="emit('blur', 'name')"
        />
        <label
            id="login-password-label"
            class="login-label"
            for="login-password"
        >
            Contraseña
        </label>
        <VTextField
            id="login-password"
            name="password"
            autocomplete="current-password"
            placeholder="Ingresa tu contraseña"
            aria-label="Contraseña"
            :aria-invalid="!!errors.password"
            :type="isPasswordVisible ? 'text' : 'password'"
            :model-value="password"
            :error-messages="errors.password"
            :disabled="isSubmitting"
            variant="solo"
            flat
            rounded="lg"
            bg-color="#f6faf7"
            color="primary"
            base-color="#332d2d"
            @update:model-value="emit('update:password', $event ?? '')"
            @blur="emit('blur', 'password')"
        />
        <div class="login-options">
            <VCheckbox
                :model-value="shouldRememberUser"
                label="Recordar usuario"
                :disabled="isSubmitting"
                color="primary"
                hide-details
                density="compact"
                @update:model-value="emit('update:shouldRememberUser', $event === true)"
            />
            <button
                class="password-toggle"
                type="button"
                :aria-pressed="isPasswordVisible"
                :disabled="isSubmitting"
                @click="emit('togglePassword')"
            >
                {{ isPasswordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña' }}
            </button>
        </div>
        <p
            v-if="message"
            class="login-error"
            role="alert"
            aria-label="Error de acceso"
        >
            {{ message }}
        </p>
        <VBtn
            type="submit"
            color="primary"
            block
            rounded="pill"
            size="large"
            :loading="isSubmitting"
            :disabled="isSubmitting"
            class="login-submit"
        >
            {{ isSubmitting ? 'Ingresando…' : 'Ingresar' }}
        </VBtn>
    </form>
</template>

<style scoped>
.login-label {
    display: block;
    color: #d7e6dc;
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
}

.login-form :deep(.v-field__input) {
    color: #332d2d;
    opacity: 1;
}

.login-form :deep(.v-field__input::placeholder) {
    color: #5b6860;
    opacity: 1;
}

.login-form :deep(.v-input__details) {
    color: #ffb4ab;
    padding-inline: 0;
    padding-bottom: 0.5rem;
}

.login-form :deep(.v-messages) {
    opacity: 1;
}

.login-options {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
    margin-bottom: 1.5rem;
}

.login-options :deep(.v-input) {
    flex: 0 1 auto;
}

.login-options :deep(.v-selection-control__input) {
    color: #b9dbc5;
}

.login-options :deep(.v-label) {
    color: #d7e6dc;
    font-size: 0.875rem;
    opacity: 1;
}

.password-toggle {
    background: none;
    border: 0;
    color: #9ce7b5;
    font-size: 0.8rem;
    cursor: pointer;
    padding: 0.5rem 0;
}

.password-toggle:focus-visible {
    outline: 2px solid #9ce7b5;
    outline-offset: 4px;
    border-radius: 3px;
}

.password-toggle:disabled {
    opacity: 0.6;
    cursor: default;
}

.login-error {
    color: #ffdad6;
    border: 1px solid #9c5852;
    border-radius: 0.75rem;
    background: #47201e;
    padding: 0.875rem;
    margin-bottom: 1rem;
    font-size: 0.875rem;
}

.login-submit {
    min-height: 3.25rem;
    font-weight: 800;
    text-transform: none;
    letter-spacing: 0.01em;
    background: linear-gradient(180deg, #14a44d, #0f7f3a);
    box-shadow: 0 1rem 1.8rem #14a44d47;
}
</style>
