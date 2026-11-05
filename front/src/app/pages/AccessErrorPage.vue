<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { protectedDestination } from '../router/protectedDestination.js';

defineProps<{ isUnavailable?: boolean }>();
const route = useRoute();
const router = useRouter();
const isChecking = ref(false);
const message = ref('');
const destination = computed(() => protectedDestination(router, route.query.returnTo));

const checkAccess = async () => {
    if (isChecking.value) return;

    isChecking.value = true;
    message.value = '';

    try {
        await router.replace(destination.value);
        if (router.currentRoute.value.name === 'session-unavailable')
            message.value =
                'El servidor sigue sin estar disponible. Vuelve a intentarlo cuando se restablezca la conexión.';
        else if (router.currentRoute.value.name === 'forbidden')
            message.value = 'Tu cuenta todavía no tiene permiso para abrir este módulo.';
    } catch {
        message.value = 'No se pudo abrir el módulo. Vuelve a intentarlo.';
    } finally {
        isChecking.value = false;
    }
};
</script>

<template>
    <main class="access-error">
        <h1>{{ isUnavailable ? 'No se pudo comprobar la sesión' : 'Acceso no permitido' }}</h1>
        <p>
            {{
                isUnavailable
                    ? 'No fue posible conectar con el servidor o comprobar tu sesión. Puedes volver a intentarlo sin cerrar tu sesión.'
                    : 'Tu cuenta no tiene permiso para abrir este módulo.'
            }}
        </p>
        <p
            v-if="message"
            role="alert"
        >
            {{ message }}
        </p>
        <button
            type="button"
            :disabled="isChecking"
            :aria-busy="isChecking"
            @click="checkAccess"
        >
            {{ isChecking ? 'Comprobando acceso…' : 'Volver a comprobar el acceso' }}
        </button>
        <RouterLink :to="{ name: 'login', query: { returnTo: destination } }">
            Iniciar sesión
        </RouterLink>
    </main>
</template>

<style scoped>
.access-error {
    max-width: 650px;
    padding: 3rem 1.5rem;
    margin: 0 auto;
}
p {
    margin: 1rem 0;
}
a {
    display: block;
    color: #14844c;
    margin: 1rem 0;
}
button {
    padding: 0.75rem 1rem;
    border: 0;
    border-radius: 0.5rem;
    background: #14844c;
    color: #fff;
    cursor: pointer;
}
button:disabled {
    cursor: wait;
    opacity: 0.7;
}
</style>
