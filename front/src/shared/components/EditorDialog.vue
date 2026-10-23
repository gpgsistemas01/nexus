<script setup lang="ts">
import { useId } from 'vue';
import { useDisplay } from 'vuetify';
import { VDialog } from 'vuetify/components/VDialog';
import { VCard, VCardTitle, VCardText, VCardActions } from 'vuetify/components/VCard';
import { VBtn } from 'vuetify/components/VBtn';
import { VDefaultsProvider } from 'vuetify/components/VDefaultsProvider';
import { controlDefaults } from '../ui/controlDefaults.js';

withDefaults(
    defineProps<{
        title: string;
        eyebrow?: string;
        context?: string;
        maxWidth?: number;
        isSubmitting: boolean;
        isSubmitDisabled?: boolean;
        submitLabel?: string;
        note?: string;
        showSubmit?: boolean;
        retainFocus?: boolean;
    }>(),
    {
        eyebrow: 'ALMACÉN',
        context: '',
        maxWidth: 1080,
        submitLabel: 'Guardar',
        note: '',
        showSubmit: true,
        retainFocus: true,
    },
);
const emit = defineEmits<{ close: []; submit: [] }>();
const { smAndDown } = useDisplay();
const formId = useId();
const titleId = useId();
</script>

<template>
    <VDialog
        :model-value="true"
        :max-width="maxWidth"
        :fullscreen="smAndDown"
        scrollable
        :persistent="isSubmitting"
        :retain-focus="retainFocus"
        @update:model-value="!$event && emit('close')"
    >
        <VDefaultsProvider :defaults="controlDefaults">
            <VCard
                class="editor-dialog"
                role="dialog"
                aria-modal="true"
                :aria-labelledby="titleId"
            >
                <VCardTitle class="editor-title">
                    <div>
                        <p>{{ eyebrow }}</p>
                        <h2 :id="titleId">{{ title }}</h2>
                    </div>
                    <VBtn
                        icon="$close"
                        variant="text"
                        aria-label="Cerrar formulario"
                        :disabled="isSubmitting"
                        @click="emit('close')"
                    />
                </VCardTitle>
                <VCardText class="editor-body">
                    <p
                        v-if="context"
                        class="editor-context"
                    >
                        {{ context }}
                    </p>
                    <form
                        :id="formId"
                        novalidate
                        :aria-busy="isSubmitting"
                        @submit.prevent="emit('submit')"
                    >
                        <slot :form-id="formId" />
                    </form>
                </VCardText>
                <VCardActions class="editor-actions">
                    <span
                        v-if="note"
                        class="editor-note"
                    >
                        {{ note }}
                    </span>
                    <VBtn
                        :disabled="isSubmitting"
                        variant="outlined"
                        @click="emit('close')"
                    >
                        Cerrar
                    </VBtn>
                    <slot name="actions" />
                    <VBtn
                        v-if="showSubmit"
                        :form="formId"
                        type="submit"
                        color="primary"
                        variant="flat"
                        :loading="isSubmitting"
                        :disabled="isSubmitting || isSubmitDisabled"
                    >
                        {{ submitLabel }}
                    </VBtn>
                </VCardActions>
            </VCard>
        </VDefaultsProvider>
    </VDialog>
</template>

<style scoped>
.editor-dialog {
    border-radius: 1rem;
    background: rgb(var(--v-theme-background));
    box-shadow: 0 1.25rem 3rem rgba(var(--v-theme-on-surface), 0.18);
}
.editor-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.5rem;
    background: rgb(var(--v-theme-modal-header));
    border-bottom: 5px solid rgb(var(--v-theme-accent));
    color: white;
    white-space: normal;
}
.editor-title p {
    font-size: 0.65rem;
    letter-spacing: 0.16em;
    opacity: 0.85;
    margin-bottom: 0.25rem;
}
.editor-title h2 {
    font-size: clamp(1.25rem, 2vw, 1.6rem);
    font-weight: 800;
    line-height: 1.25;
}
.editor-body {
    padding: 1.25rem !important;
    background: linear-gradient(180deg, rgba(var(--v-theme-primary), 0.08), transparent 16rem);
}
.editor-context {
    margin-bottom: 1rem;
    font-size: 0.85rem;
    color: rgb(var(--v-theme-muted));
}
.editor-actions {
    padding: 1rem 1.25rem;
    flex-wrap: wrap;
    gap: 0.5rem;
    background: rgb(var(--v-theme-surface));
    border-top: 1px solid rgba(var(--v-theme-primary), 0.15);
}
.editor-note {
    flex: 1 1 240px;
    color: rgb(var(--v-theme-muted));
    font-size: 0.75rem;
}
@media (max-width: 600px) {
    .editor-title {
        padding: 1rem;
    }
    .editor-body {
        padding: 0.75rem !important;
    }
    .editor-note {
        flex-basis: 100%;
    }
}
</style>
