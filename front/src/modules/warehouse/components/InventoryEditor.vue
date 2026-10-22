<script setup lang="ts">
import { VRow, VCol } from 'vuetify/components/VGrid';
import { VTextField } from 'vuetify/components/VTextField';
import { VBtn } from 'vuetify/components/VBtn';
import { VAlert } from 'vuetify/components/VAlert';
import EditorDialog from '../../../shared/components/EditorDialog.vue';
import InventoryFormField from './InventoryFormField.vue';
import type { InventoryFormSection } from '../formFields.js';
import type { InventoryField, InventoryValues } from '../inventory.js';
import type { LookupState } from '../../../shared/lookup.js';

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
    lookups: Record<string, LookupState>;
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
</script>

<template>
    <EditorDialog
        :title="title"
        :context="context"
        :is-submitting="isSubmitting"
        :is-submit-disabled="isConflicted && !isPending"
        :submit-label="isPending ? 'Recuperar captura' : 'Guardar'"
        :note="
            isPending
                ? 'Captura protegida para recuperación'
                : 'Los campos de consulta se conservan sin modificarlos.'
        "
        @close="emit('close')"
        @submit="emit('submit')"
    >
        <template #default="{ formId }">
            <VAlert
                v-if="isPending"
                type="info"
                variant="tonal"
                class="mb-4"
            >
                Hay una captura pendiente de confirmar. Recuperar enviará exactamente la captura
                anterior para comprobar su resultado, sin crear otra operación.
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
        </template>
        <template #actions>
            <VBtn
                v-if="isConflicted && !isPending"
                @click="emit('reload')"
            >
                Cerrar y actualizar inventario
            </VBtn>
        </template>
    </EditorDialog>
</template>

<style scoped>
.editor-section {
    background: rgb(var(--v-theme-surface));
    border: 1px solid rgba(var(--v-theme-primary), 0.15);
    border-radius: 0.85rem;
    padding: 1rem;
    margin-bottom: 1rem;
    box-shadow: 0 0.2rem 0.65rem rgba(var(--v-theme-on-surface), 0.04);
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
</style>
