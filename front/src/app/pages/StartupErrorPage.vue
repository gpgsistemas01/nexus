<script setup lang="ts">
import { mdiAlertCircleOutline } from '@mdi/js';
import AppStatusPage from '../components/AppStatusPage.vue';

const reloadPage = () => window.location.reload();
</script>

<template>
    <AppStatusPage
        code="Inicio"
        :icon="mdiAlertCircleOutline"
        title="No se pudo cargar la aplicación"
        description="Comprueba tu conexión y vuelve a cargar la página para iniciar Nexus. Si el problema continúa, informa al responsable del sistema."
    >
        <template #actions>
            <button
                class="status-action status-action--primary"
                type="button"
                @click="reloadPage"
            >
                Volver a intentar
            </button>
        </template>
    </AppStatusPage>
</template>
