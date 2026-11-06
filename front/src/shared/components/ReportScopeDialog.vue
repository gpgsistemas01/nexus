<script setup lang="ts">
import { VSelect } from 'vuetify/components/VSelect';
import { VTextField } from 'vuetify/components/VTextField';
import EditorDialog from './EditorDialog.vue';
import type { ReportKind, ReportScope } from '../report.js';

withDefaults(
    defineProps<{
        values: ReportScope;
        isSubmitting: boolean;
        error: string;
        validationError?: string;
        eyebrow?: string;
        subject?: string;
        kind?: ReportKind;
        note?: string;
    }>(),
    { eyebrow: 'REPORTES', subject: 'registros', validationError: '', kind: 'period', note: '' },
);
const emit = defineEmits<{
    mode: [value: ReportScope['mode']];
    month: [value: string];
    inventory: [value: NonNullable<ReportScope['inventoryScope']>];
    submit: [];
    close: [];
}>();
const modes = [
    { value: 'current-month', title: 'Mes actual' },
    { value: 'specific-month', title: 'Mes específico' },
    { value: 'filtered', title: 'Filtros aplicados en la tabla' },
] as const;
</script>

<template>
    <EditorDialog
        title="Exportar reporte"
        :eyebrow="eyebrow"
        :max-width="600"
        :is-submitting="isSubmitting"
        :message="error"
        submit-label="Descargar Excel"
        @submit="emit('submit')"
        @close="emit('close')"
    >
        <VSelect
            v-if="kind === 'period'"
            label="Alcance del reporte"
            :model-value="values.mode"
            :items="modes"
            :disabled="isSubmitting"
            @update:model-value="emit('mode', $event)"
        />
        <VTextField
            v-if="kind === 'period' && values.mode === 'specific-month'"
            label="Mes del reporte"
            type="month"
            :model-value="values.month"
            :disabled="isSubmitting"
            :error-messages="validationError"
            class="mt-4"
            @update:model-value="emit('month', $event ?? '')"
        />
        <VSelect
            v-if="kind === 'inventory'"
            label="Incluir en Excel"
            :model-value="values.inventoryScope"
            :items="[
                { title: 'Activos o con stock', value: 'activeOrStock' },
                { title: 'Activos', value: 'active' },
                { title: 'Con stock', value: 'inStock' },
            ]"
            :disabled="isSubmitting"
            @update:model-value="emit('inventory', $event)"
        />
        <p class="my-4">
            {{
                kind === 'inventory'
                    ? 'Se aplican la búsqueda, el orden y el alcance seleccionado.'
                    : values.mode === 'filtered'
                      ? 'Se aplican la búsqueda, los filtros y el orden de la tabla, en todas las páginas.'
                      : `Incluye todos los ${subject} del mes, sin los filtros de la tabla.`
            }}
        </p>
        <p v-if="note">{{ note }}</p>
    </EditorDialog>
</template>
