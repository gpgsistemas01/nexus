<script setup lang="ts">
import { VSelect } from 'vuetify/components/VSelect';
import { VTextField } from 'vuetify/components/VTextField';
import { VAlert } from 'vuetify/components/VAlert';
import EditorDialog from '../../../shared/components/EditorDialog.vue';
import type { MovementReport } from '../movement.js';

defineProps<{ values: MovementReport; isSubmitting: boolean; error: string }>();
const emit = defineEmits<{
    mode: [value: MovementReport['mode']];
    month: [value: string];
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
        eyebrow="MOVIMIENTOS"
        :max-width="600"
        :is-submitting="isSubmitting"
        submit-label="Descargar Excel"
        @submit="emit('submit')"
        @close="emit('close')"
    >
        <VSelect
            label="Alcance del reporte"
            :model-value="values.mode"
            :items="modes"
            :disabled="isSubmitting"
            @update:model-value="emit('mode', $event)"
        />
        <VTextField
            v-if="values.mode === 'specific-month'"
            label="Mes del reporte"
            type="month"
            :model-value="values.month"
            :disabled="isSubmitting"
            class="mt-4"
            @update:model-value="emit('month', $event ?? '')"
        />
        <p class="my-4">
            {{
                values.mode === 'filtered'
                    ? 'Se exportan todos los registros que coincidan con los filtros aplicados, sin limitarse a la página visible.'
                    : 'El reporte mensual incluye todos los movimientos de ese mes, sin los filtros de la tabla. El servidor determina el mes actual en la zona horaria de Ciudad de México.'
            }}
        </p>
        <VAlert
            v-if="error"
            role="alert"
            type="error"
            variant="tonal"
            class="mt-4"
        >
            {{ error }}
        </VAlert>
    </EditorDialog>
</template>
