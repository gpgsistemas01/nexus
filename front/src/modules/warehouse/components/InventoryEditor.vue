<script setup lang="ts">
import { VRow, VCol } from 'vuetify/components/VGrid';
import { VBtn } from 'vuetify/components/VBtn';
import { VAlert } from 'vuetify/components/VAlert';
import EditorDialog from '../../../shared/components/EditorDialog.vue';
import InventoryFormField from './InventoryFormField.vue';
import type { InventoryFormSection } from '../formFields.js';
import type { InventoryField, InventoryValues } from '../inventory.js';
import type { LookupItem, LookupState } from '../../../shared/lookup.js';

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
    isConfirmingDuplicate?: boolean;
    lookups: Record<string, LookupState>;
    supplier?: LookupItem;
    article?: LookupItem;
    canCreateArticle?: boolean;
    canCreateSupplier?: boolean;
    isEditingOffer?: boolean;
    canEditArticle?: boolean;
    canEditSupplier?: boolean;
    isOpeningRelatedEditor?: boolean;
    actionError?: string;
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
    createSupplier: [search: string];
    createArticle: [search: string];
    editArticle: [];
    editSupplier: [];
}>();
</script>

<template>
    <EditorDialog
        :title="title"
        :context="context"
        :is-submitting="isSubmitting"
        :message="message"
        :retain-focus="!isConfirmingDuplicate"
        :is-submit-disabled="isConflicted && !isPending"
        :submit-label="isPending ? 'Recuperar captura' : 'Guardar'"
        :note="isPending ? 'Captura protegida para recuperación' : undefined"
        @close="emit('close')"
        @submit="emit('submit')"
    >
        <template #default="{ formId }">
            <VAlert
                v-if="actionError"
                type="error"
                variant="tonal"
                class="mb-4"
            >
                {{ actionError }}
            </VAlert>
            <VAlert
                v-if="isEditingOffer && !isPending"
                type="info"
                variant="tonal"
                class="mb-4"
            >
                Los datos de artículo y proveedor se abren en sus formularios desde aquí. Para
                corregir el saldo, usa Ajustar stock.
                <div
                    v-if="canEditArticle || canEditSupplier"
                    class="d-flex flex-wrap ga-2 mt-3"
                >
                    <VBtn
                        v-if="canEditArticle"
                        variant="outlined"
                        size="small"
                        :loading="isOpeningRelatedEditor"
                        :disabled="isOpeningRelatedEditor"
                        @click="emit('editArticle')"
                    >
                        Editar artículo
                    </VBtn>
                    <VBtn
                        v-if="canEditSupplier"
                        variant="outlined"
                        size="small"
                        :loading="isOpeningRelatedEditor"
                        :disabled="isOpeningRelatedEditor"
                        @click="emit('editSupplier')"
                    >
                        Editar proveedor
                    </VBtn>
                </div>
            </VAlert>
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
            <div
                v-if="!isPending"
                class="editor-sections"
            >
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
                    <dl
                        v-if="section.summary?.length"
                        class="reference-values"
                    >
                        <div
                            v-for="item in section.summary"
                            :key="item.label"
                        >
                            <dt>{{ item.label }}</dt>
                            <dd>{{ item.value }}</dd>
                        </div>
                    </dl>
                    <VRow
                        v-if="section.fields.length"
                        density="comfortable"
                    >
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
                                :initial-option="
                                    field.name === 'supplierId'
                                        ? supplier
                                        : field.name === 'materialId'
                                          ? article
                                          : undefined
                                "
                                :create-label="
                                    field.name === 'supplierId' && canCreateSupplier
                                        ? 'Registrar proveedor'
                                        : field.name === 'materialId' && canCreateArticle
                                          ? `Registrar ${field.label.toLocaleLowerCase()}`
                                          : undefined
                                "
                                @create="
                                    field.name === 'supplierId'
                                        ? emit('createSupplier', $event)
                                        : field.name === 'materialId' &&
                                          emit('createArticle', $event)
                                "
                                @update="emit('update', field.name, $event)"
                                @blur="emit('blur', field.name)"
                                @search="emit('search', field.name, $event)"
                                @more="emit('more', field.name)"
                                @retry="emit('retry', field.name)"
                            />
                        </VCol>
                    </VRow>
                </section>
            </div>
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
.editor-sections {
    display: grid;
    gap: 1rem;
}
.editor-section {
    background: rgb(var(--v-theme-surface));
    border: 1px solid rgba(var(--v-theme-primary), 0.15);
    border-radius: 0.85rem;
    padding: 1rem;
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
.reference-values {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr));
    gap: 0.75rem 1rem;
    margin: 0;
}
.reference-values dt {
    color: rgb(var(--v-theme-muted));
    font-size: 0.8rem;
}
.reference-values dd {
    margin: 0;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    overflow-wrap: anywhere;
}
.reference-values + .v-row {
    margin-block-start: 1rem;
}
</style>
