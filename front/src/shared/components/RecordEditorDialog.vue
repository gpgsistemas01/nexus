<script setup lang="ts">
import { VAlert } from 'vuetify/components/VAlert';
import { VBtn } from 'vuetify/components/VBtn';
import EditorDialog from './EditorDialog.vue';

withDefaults(
    defineProps<{
        title: string;
        eyebrow: string;
        message: string;
        isSubmitting: boolean;
        isConflicted: boolean;
        submitLabel?: string;
        maxWidth?: number;
        context?: string;
        note?: string;
        reloadLabel?: string;
        showSubmit?: boolean;
        retainFocus?: boolean;
    }>(),
    {
        submitLabel: 'Guardar',
        maxWidth: 720,
        context: '',
        note: '',
        reloadLabel: 'Cerrar y actualizar listado',
        showSubmit: true,
        retainFocus: true,
    },
);
const emit = defineEmits<{ close: []; submit: []; reload: [] }>();
</script>

<template>
    <EditorDialog
        :title="title"
        :eyebrow="eyebrow"
        :context="context"
        :note="note"
        :max-width="maxWidth"
        :is-submitting="isSubmitting"
        :is-submit-disabled="isConflicted"
        :submit-label="submitLabel"
        :show-submit="showSubmit"
        :retain-focus="retainFocus"
        @close="emit('close')"
        @submit="emit('submit')"
    >
        <VAlert
            v-if="message"
            role="alert"
            type="error"
            variant="tonal"
            class="mb-4"
        >
            {{ message }}
        </VAlert>
        <div class="record-fields"><slot /></div>
        <template #actions>
            <VBtn
                v-if="isConflicted"
                @click="emit('reload')"
            >
                {{ reloadLabel }}
            </VBtn>
        </template>
    </EditorDialog>
</template>

<style scoped>
.record-fields {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    min-width: 0;
    gap: 1.25rem;
    padding: 1rem;
    background: rgb(var(--v-theme-surface));
    border: 1px solid rgba(var(--v-theme-primary), 0.15);
    border-radius: 0.85rem;
}
</style>
