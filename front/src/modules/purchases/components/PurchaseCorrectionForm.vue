<script setup lang="ts">
import { VTextField } from 'vuetify/components/VTextField';
import RecordEditorDialog from '../../../shared/components/RecordEditorDialog.vue';

defineProps<{
    context: string;
    values: { quantity: string; costPerUnitType: string };
    errors: Partial<Record<'quantity' | 'costPerUnitType', string>>;
    message: string;
    isSubmitting: boolean;
    isConflicted: boolean;
}>();
const emit = defineEmits<{
    update: [field: 'quantity' | 'costPerUnitType', value: string];
    blur: [field: 'quantity' | 'costPerUnitType'];
    submit: [];
    close: [];
    reload: [];
}>();
</script>

<template>
    <RecordEditorDialog
        title="Corregir partida"
        eyebrow="COMPRAS"
        :context="context"
        :message="message"
        :is-submitting="isSubmitting"
        :is-conflicted="isConflicted"
        note="La cantidad y el costo reemplazan los valores actuales de esta partida."
        submit-label="Guardar corrección"
        @submit="emit('submit')"
        @close="emit('close')"
        @reload="emit('reload')"
    >
        <VTextField
            label="Cantidad correcta"
            type="number"
            min="0"
            step="0.01"
            :model-value="values.quantity"
            :error-messages="errors.quantity"
            :disabled="isSubmitting"
            @update:model-value="emit('update', 'quantity', $event ?? '')"
            @blur="emit('blur', 'quantity')"
        />
        <VTextField
            label="Costo por presentación correcto"
            type="number"
            min="0"
            step="0.000001"
            :model-value="values.costPerUnitType"
            :error-messages="errors.costPerUnitType"
            :disabled="isSubmitting"
            @update:model-value="emit('update', 'costPerUnitType', $event ?? '')"
            @blur="emit('blur', 'costPerUnitType')"
        />
    </RecordEditorDialog>
</template>
