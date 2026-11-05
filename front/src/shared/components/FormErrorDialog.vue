<script setup lang="ts">
import { ref, useId, watch } from 'vue';
import { VDialog } from 'vuetify/components/VDialog';
import { VCard, VCardTitle, VCardText, VCardActions } from 'vuetify/components/VCard';
import { VBtn } from 'vuetify/components/VBtn';
import { VIcon } from 'vuetify/components/VIcon';

const props = withDefaults(
    defineProps<{ message: string; isSubmitting: boolean; title?: string }>(),
    { title: 'No se pudo completar la operación' },
);
const isOpen = ref(false);
const titleId = useId();
const messageId = useId();

watch(
    [() => props.message, () => props.isSubmitting],
    ([message, isSubmitting]) => {
        isOpen.value = !!message && !isSubmitting;
    },
    { immediate: true },
);
</script>

<template>
    <VDialog
        v-model="isOpen"
        role="alertdialog"
        :aria-labelledby="titleId"
        :aria-describedby="messageId"
        :max-width="520"
        theme="warehouse"
        persistent
    >
        <VCard class="form-error-dialog">
            <VCardTitle class="form-error-title">
                <VIcon
                    icon="$error"
                    color="error"
                    aria-hidden="true"
                />
                <h2 :id="titleId">{{ title }}</h2>
            </VCardTitle>
            <VCardText>
                <p :id="messageId">{{ message }}</p>
            </VCardText>
            <VCardActions class="form-error-actions">
                <VBtn
                    color="primary"
                    variant="flat"
                    @click="isOpen = false"
                >
                    Volver al formulario
                </VBtn>
            </VCardActions>
        </VCard>
    </VDialog>
</template>

<style scoped>
.form-error-dialog {
    border-radius: 1rem;
    overflow-wrap: anywhere;
}
.form-error-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1.25rem;
    white-space: normal;
}
.form-error-title h2 {
    font-size: 1.2rem;
    line-height: 1.4;
}
.form-error-actions {
    padding: 1rem 1.25rem;
}
</style>
