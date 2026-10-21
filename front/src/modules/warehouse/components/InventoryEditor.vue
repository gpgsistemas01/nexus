<script setup lang="ts">
import { useId } from 'vue';
import { useDisplay } from 'vuetify';
import { VDialog } from 'vuetify/components/VDialog';
import { VCard, VCardTitle, VCardText, VCardActions } from 'vuetify/components/VCard';
import { VRow, VCol } from 'vuetify/components/VGrid';
import { VTextField } from 'vuetify/components/VTextField';
import { VBtn } from 'vuetify/components/VBtn';
import { VAlert } from 'vuetify/components/VAlert';
import { VDefaultsProvider } from 'vuetify/components/VDefaultsProvider';
import { controlDefaults } from '../../../shared/ui/controlDefaults.js';
import InventoryFormField from './InventoryFormField.vue';
import type { InventoryFormSection } from '../formFields.js';
import type { InventoryField, InventoryValues, LookupItem } from '../inventory.js';

defineProps<{
    title: string;
    context?: string;
    sections: InventoryFormSection[];
    values: InventoryValues;
    errors: Partial<Record<InventoryField, string>>;
    message: string;
    isSubmitting: boolean;
    isPending: boolean;
    isConflicted: boolean;
    lookups: Record<
        string,
        { items: LookupItem[]; isLoading: boolean; error: string; hasMore: boolean }
    >;
}>();
const emit = defineEmits<{
    update: [field: InventoryField, value: string | boolean];
    blur: [field: InventoryField];
    search: [field: InventoryField, value: string];
    more: [field: InventoryField];
    retry: [field: InventoryField];
    submit: [];
    close: [];
    reload: [];
}>();
const { smAndDown } = useDisplay();
const formId = useId();
const titleId = useId();
</script>

<template>
    <VDialog
        :model-value="true"
        max-width="1080"
        :fullscreen="smAndDown"
        scrollable
        :persistent="isSubmitting"
        @update:model-value="!$event && emit('close')"
    >
        <VDefaultsProvider :defaults="controlDefaults">
            <VCard
                class="inventory-editor"
                role="dialog"
                aria-modal="true"
                :aria-labelledby="titleId"
            >
                <VCardTitle class="editor-title">
                    <div>
                        <p>ALMACÉN</p>
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
                        <VAlert
                            v-if="isPending"
                            type="info"
                            variant="tonal"
                            class="mb-4"
                        >
                            Hay una captura pendiente de confirmar. Recuperar enviará exactamente la
                            captura anterior para comprobar su resultado, sin crear otra operación.
                            <p>
                                {{ values.name || context }} · Cantidad:
                                {{ values.quantity || values.initialQuantity }}
                            </p>
                        </VAlert>
                        <VAlert
                            v-if="message"
                            role="alert"
                            type="error"
                            variant="tonal"
                            class="mb-4"
                        >
                            {{ message }}
                        </VAlert>
                        <template v-if="!isPending">
                            <section
                                v-for="section in sections"
                                :key="section.id"
                                class="editor-section"
                                :aria-labelledby="`${formId}-${section.id}`"
                            >
                                <header class="section-heading">
                                    <h3 :id="`${formId}-${section.id}`">{{ section.title }}</h3>
                                    <p v-if="section.description">{{ section.description }}</p>
                                </header>
                                <VRow density="compact">
                                    <VCol
                                        v-for="item in section.summary"
                                        :key="item.label"
                                        cols="12"
                                        md="6"
                                    >
                                        <VTextField
                                            :label="item.label"
                                            :model-value="item.value"
                                            readonly
                                            class="consultation-field"
                                        />
                                    </VCol>
                                    <VCol
                                        v-for="field in section.fields"
                                        :key="field.name"
                                        cols="12"
                                        :md="field.isWide ? 12 : 6"
                                    >
                                        <InventoryFormField
                                            :field="field"
                                            :value="values[field.name]"
                                            :error="errors[field.name]"
                                            :is-disabled="isSubmitting"
                                            :lookup="lookups[field.name]"
                                            @update="emit('update', field.name, $event)"
                                            @blur="emit('blur', field.name)"
                                            @search="emit('search', field.name, $event)"
                                            @more="emit('more', field.name)"
                                            @retry="emit('retry', field.name)"
                                        />
                                    </VCol>
                                </VRow>
                            </section>
                        </template>
                    </form>
                </VCardText>
                <VCardActions class="editor-actions">
                    <span class="editor-note">
                        {{
                            isPending
                                ? 'Captura protegida para recuperación'
                                : 'Los campos de consulta se conservan sin modificarlos.'
                        }}
                    </span>
                    <VBtn
                        :disabled="isSubmitting"
                        variant="outlined"
                        @click="emit('close')"
                    >
                        Cerrar
                    </VBtn>
                    <VBtn
                        v-if="isConflicted && !isPending"
                        @click="emit('reload')"
                    >
                        Cerrar y actualizar inventario
                    </VBtn>
                    <VBtn
                        :form="formId"
                        type="submit"
                        color="primary"
                        variant="flat"
                        :loading="isSubmitting"
                        :disabled="isSubmitting || (isConflicted && !isPending)"
                    >
                        {{ isPending ? 'Recuperar captura' : 'Guardar' }}
                    </VBtn>
                </VCardActions>
            </VCard>
        </VDefaultsProvider>
    </VDialog>
</template>

<style scoped>
.inventory-editor {
    border-radius: 1rem;
    background: rgb(var(--v-theme-background));
}
.editor-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.5rem;
    background: rgb(var(--v-theme-primary));
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
}
.editor-context {
    margin-bottom: 1rem;
    font-size: 0.85rem;
    color: rgb(var(--v-theme-muted));
}
.editor-section {
    background: rgb(var(--v-theme-surface));
    border: 1px solid rgba(var(--v-theme-primary), 0.15);
    border-radius: 0.85rem;
    padding: 1rem;
    margin-bottom: 1rem;
}
.section-heading {
    border-bottom: 1px solid rgba(var(--v-theme-primary), 0.22);
    padding-bottom: 0.65rem;
    margin-bottom: 1rem;
}
.section-heading h3 {
    color: rgb(var(--v-theme-primary));
    font-size: 0.95rem;
    font-weight: 800;
}
.section-heading p {
    margin-top: 0.35rem;
    font-size: 0.8rem;
    color: rgb(var(--v-theme-muted));
}
.editor-section :deep(.v-col) {
    padding: 0.45rem;
}
.consultation-field :deep(.v-field) {
    background: rgba(var(--v-theme-on-surface), 0.04);
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
