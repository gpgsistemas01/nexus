<script setup lang="ts">
import { VTextField } from 'vuetify/components/VTextField';
import { VCheckbox } from 'vuetify/components/VCheckbox';
import { VAlert } from 'vuetify/components/VAlert';
import { VBtn } from 'vuetify/components/VBtn';
import EditorDialog from '../../../shared/components/EditorDialog.vue';
import type { CatalogField, CatalogValues } from '../catalog.js';
defineProps<{
    title: string;
    values: CatalogValues;
    errors: Partial<Record<CatalogField, string>>;
    message: string;
    isSubmitting: boolean;
    isConflicted: boolean;
    hasSymbol: boolean;
    maxNameLength: number;
    maxSymbolLength?: number;
    isEditing: boolean;
}>();
const emit = defineEmits<{
    update: [field: CatalogField, value: string | boolean];
    blur: [field: CatalogField];
    submit: [];
    close: [];
    reload: [];
}>();
</script>
<template>
    <EditorDialog
        :title="title"
        eyebrow="CATÁLOGOS"
        :max-width="600"
        :is-submitting="isSubmitting"
        :is-submit-disabled="isConflicted"
        :submit-label="isEditing ? 'Actualizar' : 'Guardar'"
        note="Desactiva un registro para conservar su historial."
        @close="emit('close')"
        @submit="emit('submit')"
    >
        <VAlert
            v-if="message"
            role="alert"
            type="error"
            variant="tonal"
            class="mb-4"
            >{{ message }}</VAlert
        >
        <section class="catalog-fields">
            <VTextField
                label="Nombre"
                name="name"
                :model-value="values.name"
                :maxlength="maxNameLength"
                :error-messages="errors.name"
                :disabled="isSubmitting || isConflicted"
                @update:model-value="emit('update', 'name', $event ?? '')"
                @blur="emit('blur', 'name')"
            />
            <VTextField
                v-if="hasSymbol"
                label="Símbolo"
                name="symbol"
                :model-value="values.symbol"
                :maxlength="maxSymbolLength"
                :error-messages="errors.symbol"
                :disabled="isSubmitting || isConflicted"
                @update:model-value="emit('update', 'symbol', $event ?? '')"
                @blur="emit('blur', 'symbol')"
            />
            <VCheckbox
                label="Activo"
                :model-value="values.isActive"
                :error-messages="errors.isActive"
                :disabled="isSubmitting || isConflicted"
                @update:model-value="emit('update', 'isActive', $event === true)"
            />
        </section>
        <template #actions
            ><VBtn
                v-if="isConflicted"
                @click="emit('reload')"
                >Cerrar y actualizar catálogo</VBtn
            ></template
        >
    </EditorDialog>
</template>
<style scoped>
.catalog-fields {
    display: grid;
    gap: 1.25rem;
    padding: 1rem;
    background: rgb(var(--v-theme-surface));
    border: 1px solid rgba(var(--v-theme-primary), 0.15);
    border-radius: 0.85rem;
}
</style>
