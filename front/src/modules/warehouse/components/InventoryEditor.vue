<script setup lang="ts">
import { VDialog } from 'vuetify/components/VDialog';
import { VCard, VCardTitle, VCardText, VCardActions } from 'vuetify/components/VCard';
import { VTextField } from 'vuetify/components/VTextField';
import { VTextarea } from 'vuetify/components/VTextarea';
import { VCheckbox } from 'vuetify/components/VCheckbox';
import { VBtn } from 'vuetify/components/VBtn';
import { VAlert } from 'vuetify/components/VAlert';
import RemoteSelect from './RemoteSelect.vue';
import type { InventoryFieldSpec } from '../formFields.js';
import type { InventoryField, InventoryValues, LookupItem } from '../inventory.js';

defineProps<{
    title: string;
    context?: string;
    fields: InventoryFieldSpec[];
    values: InventoryValues;
    errors: Partial<Record<InventoryField, string>>;
    message: string;
    isSubmitting: boolean;
    isPending: boolean;
    isConflicted: boolean;
    isDelete: boolean;
    weightPreview?: number | null;
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
    submit: [];
    close: [];
    reload: [];
}>();
</script>

<template>
    <VDialog
        :model-value="true"
        max-width="760"
        :persistent="isSubmitting"
        @update:model-value="!$event && emit('close')"
    >
        <VCard
            class="inventory-editor"
            role="dialog"
            aria-modal="true"
            aria-labelledby="inventory-editor-title"
        >
            <form
                novalidate
                :aria-busy="isSubmitting"
                @submit.prevent="emit('submit')"
            >
                <VCardTitle
                    id="inventory-editor-title"
                    class="editor-title"
                    >{{ title }}</VCardTitle
                >
                <VCardText>
                    <p
                        v-if="context"
                        class="editor-context"
                    >
                        {{ context }}
                    </p>
                    <VAlert
                        v-if="isDelete"
                        type="warning"
                        variant="tonal"
                        class="mb-4"
                    >
                        Se eliminará la relación con este proveedor. Si no quedan otros proveedores,
                        también se eliminará el material. Confirma únicamente si es el registro
                        correcto.
                    </VAlert>
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
                        >{{ message }}</VAlert
                    >
                    <p
                        v-if="weightPreview != null"
                        class="weight-preview"
                    >
                        Peso neto estimado: <strong>{{ weightPreview }} kg</strong>. El servidor
                        confirma las medidas al guardar.
                    </p>
                    <div
                        v-if="!isPending"
                        class="editor-fields"
                    >
                        <div
                            v-for="field in fields"
                            :key="field.name"
                            :class="{ 'wide-field': field.type === 'textarea' }"
                        >
                            <RemoteSelect
                                v-if="field.type === 'lookup'"
                                :label="field.label"
                                :model-value="String(values[field.name])"
                                :items="lookups[field.name]?.items ?? []"
                                :is-loading="lookups[field.name]?.isLoading ?? false"
                                :error="errors[field.name] || lookups[field.name]?.error"
                                :has-more="lookups[field.name]?.hasMore"
                                :is-disabled="isSubmitting || isPending"
                                @update:model-value="emit('update', field.name, $event)"
                                @search="emit('search', field.name, $event)"
                                @more="emit('more', field.name)"
                                @blur="emit('blur', field.name)"
                            />
                            <VCheckbox
                                v-else-if="field.type === 'checkbox'"
                                :label="field.label"
                                :model-value="!!values[field.name]"
                                :disabled="isSubmitting || isPending"
                                :error-messages="errors[field.name]"
                                color="primary"
                                @update:model-value="emit('update', field.name, $event === true)"
                            />
                            <VTextarea
                                v-else-if="field.type === 'textarea'"
                                :label="field.label"
                                :model-value="String(values[field.name])"
                                :disabled="isSubmitting || isPending"
                                :error-messages="errors[field.name]"
                                rows="2"
                                variant="outlined"
                                @update:model-value="emit('update', field.name, $event ?? '')"
                                @blur="emit('blur', field.name)"
                            />
                            <VTextField
                                v-else
                                :label="field.label"
                                :aria-label="field.label"
                                :name="field.name"
                                :type="field.type === 'number' ? 'number' : 'text'"
                                :model-value="field.displayValue ?? String(values[field.name])"
                                :readonly="field.isReadOnly"
                                :disabled="isSubmitting || isPending"
                                :error-messages="errors[field.name]"
                                :hint="field.hint"
                                :step="field.type === 'number' ? 'any' : undefined"
                                variant="outlined"
                                density="comfortable"
                                @update:model-value="emit('update', field.name, $event ?? '')"
                                @blur="emit('blur', field.name)"
                            />
                        </div>
                    </div>
                </VCardText>
                <VCardActions class="editor-actions">
                    <VBtn
                        :disabled="isSubmitting"
                        @click="emit('close')"
                        >Cerrar</VBtn
                    >
                    <VBtn
                        v-if="isConflicted && !isPending"
                        @click="emit('reload')"
                        >Cerrar y actualizar inventario</VBtn
                    >
                    <VBtn
                        type="submit"
                        :color="isDelete ? 'error' : 'primary'"
                        variant="flat"
                        :loading="isSubmitting"
                        :disabled="isSubmitting || (isConflicted && !isPending)"
                    >
                        {{
                            isPending
                                ? 'Recuperar captura'
                                : isDelete
                                  ? 'Confirmar eliminación'
                                  : 'Guardar'
                        }}
                    </VBtn>
                </VCardActions>
            </form>
        </VCard>
    </VDialog>
</template>

<style scoped>
.inventory-editor {
    border-radius: 1.25rem;
}
.editor-title {
    padding: 1.5rem 1.5rem 0.5rem;
    white-space: normal;
    font-weight: 700;
}
.editor-context {
    margin-bottom: 1.25rem;
    color: #456354;
}
.editor-fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.25rem 1rem;
}
.wide-field {
    grid-column: 1 / -1;
}
.editor-actions {
    padding: 0 1.5rem 1.5rem;
    flex-wrap: wrap;
    gap: 0.5rem;
}
.weight-preview {
    margin-bottom: 1rem;
    padding: 0.75rem;
    border-radius: 0.5rem;
    background: #e8f6ee;
}
@media (max-width: 600px) {
    .editor-fields {
        grid-template-columns: 1fr;
    }
}
</style>
