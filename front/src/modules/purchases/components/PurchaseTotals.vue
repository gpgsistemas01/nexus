<script setup lang="ts">
import { currencyText, numberText } from '../../../shared/utils/formatNumbers.js';
import RecordTotals from '../../../shared/components/RecordTotals.vue';

withDefaults(
    defineProps<{
        totals: { quantity: number; net: number; gross: number } | null;
        isCorrection?: boolean;
    }>(),
    { isCorrection: false },
);
</script>

<template>
    <RecordTotals
        :label="isCorrection ? 'Nuevos totales estimados' : 'Totales de compra'"
        :fields="[
            {
                label: isCorrection ? 'Cantidad total' : 'Cantidad Total',
                value: numberText(totals?.quantity),
            },
            {
                label: isCorrection ? 'Subtotal' : 'Total de Compra s/ IVA',
                value: currencyText(totals?.net),
            },
            {
                label: isCorrection ? 'Total con IVA' : 'Total de Compra c/ IVA',
                value: currencyText(totals?.gross),
            },
        ]"
    />
</template>
