<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { mdiCloudOffOutline, mdiLockOutline } from '@mdi/js';
import AppStatusPage from '../components/AppStatusPage.vue';
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
    <AppStatusPage
        :code="isUnavailable ? 'Conexión' : '403'"
        :icon="isUnavailable ? mdiCloudOffOutline : mdiLockOutline"
        :title="isUnavailable ? 'No se pudo comprobar la sesión' : 'Acceso no permitido'"
        :description="
            isUnavailable
                ? 'No fue posible conectar con el servidor o comprobar tu sesión. Puedes volver a intentarlo sin cerrar tu sesión.'
                : 'Tu cuenta no tiene permiso para abrir este módulo. Solicita acceso al responsable del sistema o inicia sesión con tu cuenta autorizada.'
        "
        :notice="message"
    >
        <template #actions>
            <button
                class="status-action status-action--primary"
                type="button"
                :disabled="isChecking"
                :aria-busy="isChecking"
                @click="checkAccess"
            >
                {{ isChecking ? 'Comprobando acceso…' : 'Volver a comprobar el acceso' }}
            </button>
            <RouterLink
                class="status-action"
                :to="{ name: 'login', query: { returnTo: destination } }"
            >
                Iniciar sesión
            </RouterLink>
        </template>
    </AppStatusPage>
</template>
