<script setup lang="ts">
import { useId } from 'vue';
import { VDialog } from 'vuetify/components/VDialog';
import { VCard, VCardTitle, VCardText, VCardActions } from 'vuetify/components/VCard';
import { VBtn } from 'vuetify/components/VBtn';
import { VProgressCircular } from 'vuetify/components/VProgressCircular';

defineProps<{ isReading: boolean; error: string; loadingLabel: string; canRetry: boolean }>();
const emit = defineEmits<{ retry: []; cancel: [] }>();
const titleId = useId();
</script>

<template>
    <VDialog
        :model-value="true"
        :max-width="520"
        persistent
    >
        <VCard
            class="read-dialog"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="titleId"
            :aria-busy="isReading"
        >
            <VCardTitle class="read-dialog-title">
                <h2 :id="titleId">
                    {{ isReading ? loadingLabel : 'No se pudo completar la consulta' }}
                </h2>
            </VCardTitle>
            <VCardText class="read-dialog-body">
                <VProgressCircular
                    v-if="isReading"
                    indeterminate
                    color="primary"
                    :size="48"
                    :aria-label="loadingLabel"
                />
                <p
                    v-else
                    role="alert"
                >
                    {{ error }}
                </p>
            </VCardText>
            <VCardActions class="read-dialog-actions">
                <VBtn
                    variant="outlined"
                    @click="emit('cancel')"
                >
                    Cancelar consulta
                </VBtn>
                <VBtn
                    v-if="!isReading && canRetry"
                    color="primary"
                    variant="flat"
                    @click="emit('retry')"
                >
                    Reintentar consulta
                </VBtn>
            </VCardActions>
        </VCard>
    </VDialog>
</template>

<style scoped>
.read-dialog {
    border-radius: 1rem;
}
.read-dialog-title {
    padding: 1.25rem;
    white-space: normal;
    background: rgb(var(--v-theme-modal-header));
    border-bottom: 4px solid rgb(var(--v-theme-accent));
    color: white;
}
.read-dialog-title h2 {
    font-size: 1.2rem;
    line-height: 1.4;
}
.read-dialog-body {
    display: grid;
    justify-items: center;
    padding: 1.5rem;
    overflow-wrap: anywhere;
}
.read-dialog-actions {
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 1rem 1.25rem;
}
</style>
