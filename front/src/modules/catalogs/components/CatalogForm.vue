<script setup lang="ts">
import { VSelect } from 'vuetify/components/VSelect';
import RemoteSelect from '../../../shared/components/RemoteSelect.vue';
import type { LookupState, LookupItem } from '../../../shared/lookup.js';
import { VTextField } from 'vuetify/components/VTextField';
import { VCheckbox } from 'vuetify/components/VCheckbox';
import RecordEditorDialog from '../../../shared/components/RecordEditorDialog.vue';
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
    isTypeFixed?: boolean;
    isMaterial?: boolean;
    canEditIdentity?: boolean;
    fixedMeasurements?: boolean;
    presentations?: LookupState;
    units?: LookupState;
    selectedPresentation?: LookupItem;
    selectedUnit?: LookupItem;
}>();
const emit = defineEmits<{
    update: [field: CatalogField, value: string | boolean];
    blur: [field: CatalogField];
    submit: [];
    close: [];
    reload: [];
    search: [field: 'presentationId' | 'unitMeasureId', search: string];
    more: [field: 'presentationId' | 'unitMeasureId'];
    retry: [field: 'presentationId' | 'unitMeasureId'];
}>();
</script>

<template>
    <RecordEditorDialog
        :title="title"
        :eyebrow="isMaterial ? 'ALMACÉN' : 'CATÁLOGOS'"
        :max-width="isMaterial ? 800 : 600"
        :is-submitting="isSubmitting"
        :is-conflicted="isConflicted"
        :message="message"
        :reload-label="
            isMaterial ? 'Cerrar y actualizar artículos' : 'Cerrar y actualizar catálogo'
        "
        :submit-label="isEditing ? 'Actualizar' : 'Guardar'"
        :note="
            isMaterial
                ? isEditing && !canEditIdentity
                    ? 'Puede editar Nombre y Stock mínimo. Los documentos registrados conservan el nombre que tenían al guardarse.'
                    : 'Puede editar todos los campos mientras el artículo no tenga proveedores vinculados.'
                : 'Desactiva un registro para conservar su historial.'
        "
        @close="emit('close')"
        @submit="emit('submit')"
        @reload="emit('reload')"
    >
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
        <div
            v-if="isMaterial"
            class="article-fields"
        >
            <VSelect
                v-if="!isTypeFixed"
                class="article-fields__wide"
                label="Tipo"
                :items="[
                    { title: 'Material', value: 'MATERIAL' },
                    { title: 'Consumible', value: 'CONSUMABLE' },
                ]"
                :model-value="values.type"
                :error-messages="errors.type"
                :disabled="!canEditIdentity || isTypeFixed || isSubmitting || isConflicted"
                @update:model-value="emit('update', 'type', $event)"
            />
            <RemoteSelect
                label="Presentación"
                :model-value="values.presentationId ?? ''"
                :state="presentations"
                :initial-option="selectedPresentation"
                :error="errors.presentationId"
                :is-disabled="!canEditIdentity || isSubmitting || isConflicted"
                @update:model-value="emit('update', 'presentationId', $event)"
                @search="emit('search', 'presentationId', $event)"
                @more="emit('more', 'presentationId')"
                @retry="emit('retry', 'presentationId')"
                @blur="emit('blur', 'presentationId')"
            />
            <RemoteSelect
                label="Unidad de medida"
                :model-value="values.unitMeasureId ?? ''"
                :state="units"
                :initial-option="selectedUnit"
                :error="errors.unitMeasureId"
                :is-disabled="!canEditIdentity || isSubmitting || isConflicted"
                @update:model-value="emit('update', 'unitMeasureId', $event)"
                @search="emit('search', 'unitMeasureId', $event)"
                @more="emit('more', 'unitMeasureId')"
                @retry="emit('retry', 'unitMeasureId')"
                @blur="emit('blur', 'unitMeasureId')"
            />
            <template v-if="!fixedMeasurements">
                <VTextField
                    label="Base"
                    type="number"
                    min="0.01"
                    step="0.01"
                    :model-value="values.base"
                    :error-messages="errors.base"
                    :readonly="!canEditIdentity"
                    :disabled="isSubmitting || isConflicted"
                    @update:model-value="emit('update', 'base', $event ?? '')"
                    @blur="emit('blur', 'base')"
                />
                <VTextField
                    label="Altura"
                    type="number"
                    min="0.01"
                    step="0.01"
                    :model-value="values.height"
                    :error-messages="errors.height"
                    :readonly="!canEditIdentity"
                    :disabled="isSubmitting || isConflicted"
                    @update:model-value="emit('update', 'height', $event ?? '')"
                    @blur="emit('blur', 'height')"
                />
            </template>
            <VTextField
                class="article-fields__wide"
                label="Stock mínimo"
                type="number"
                min="0"
                step="0.01"
                :model-value="values.minStock"
                :error-messages="errors.minStock"
                :disabled="isSubmitting || isConflicted"
                @update:model-value="emit('update', 'minStock', $event ?? '')"
                @blur="emit('blur', 'minStock')"
            />
        </div>
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
            v-if="!isMaterial"
            label="Activo"
            :model-value="values.isActive"
            :error-messages="errors.isActive"
            :disabled="isSubmitting || isConflicted"
            @update:model-value="emit('update', 'isActive', $event === true)"
        />
    </RecordEditorDialog>
</template>

<style scoped>
.article-fields {
    display: grid;
    gap: 0 1rem;
    grid-template-columns: repeat(2, minmax(0, 1fr));
}
.article-fields__wide {
    grid-column: 1 / -1;
}
@media (max-width: 599px) {
    .article-fields {
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>
