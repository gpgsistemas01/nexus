<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { mdiMapMarkerQuestionOutline } from '@mdi/js';
import AppStatusPage from '../components/AppStatusPage.vue';
</script>

<template>
    <AppStatusPage
        code="404"
        :icon="mdiMapMarkerQuestionOutline"
        title="Página no encontrada"
        description="La dirección que abriste no corresponde a una página de Nexus. Revisa el enlace o vuelve al inicio para continuar."
    >
        <template #actions>
            <RouterLink
                class="status-action status-action--primary"
                :to="{ name: 'login' }"
            >
                Volver al inicio
            </RouterLink>
        </template>
    </AppStatusPage>
</template>
