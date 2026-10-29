<script setup lang="ts">
import { VTextField } from 'vuetify/components/VTextField';
import PurchaseTotals from './PurchaseTotals.vue';
import RecordEditorDialog from '../../../shared/components/RecordEditorDialog.vue';

defineProps<{
    context: string;
    totals: { quantity: number; net: number; gross: number } | null;
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
        title="Corregir detalle de compra"
        eyebrow="COMPRAS"
        :context="`Material a corregir: ${context}`"
        :message="message"
        :is-submitting="isSubmitting"
        :retain-focus="!isSubmitting"
        close-label="Regresar"
        :is-conflicted="isConflicted"
        note="La cantidad y el costo reemplazan los valores actuales de este detalle."
        submit-label="Corregir detalle"
        @submit="emit('submit')"
        @close="emit('close')"
        @reload="emit('reload')"
    >
        <h3>Corrección del detalle</h3>
        <VTextField
            label="Cantidad correcta"
            type="number"
            min="0.01"
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
            min="0.000001"
            step="0.000001"
            :model-value="values.costPerUnitType"
            :error-messages="errors.costPerUnitType"
            :disabled="isSubmitting"
            @update:model-value="emit('update', 'costPerUnitType', $event ?? '')"
            @blur="emit('blur', 'costPerUnitType')"
        />
        <h3>Nuevos totales estimados</h3>
        <PurchaseTotals
            :totals="totals"
            is-correction
        />
    </RecordEditorDialog>
</template>
