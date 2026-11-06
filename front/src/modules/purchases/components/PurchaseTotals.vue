<script setup lang="ts">
import { currencyText, numberText } from '../../../shared/utils/formatNumbers.js';

withDefaults(
    defineProps<{
        totals: { quantity: number; net: number; gross: number } | null;
        isCorrection?: boolean;
    }>(),
    { isCorrection: false },
);
</script>

<template>
    <dl
        class="purchase-totals"
        :aria-label="isCorrection ? 'Nuevos totales estimados' : 'Totales de compra'"
    >
        <div>
            <dt>{{ isCorrection ? 'Cantidad total' : 'Cantidad Total' }}</dt>
            <dd>{{ numberText(totals?.quantity) }}</dd>
        </div>
        <div>
            <dt>{{ isCorrection ? 'Subtotal' : 'Total de Compra s/ IVA' }}</dt>
            <dd>{{ currencyText(totals?.net) }}</dd>
        </div>
        <div>
            <dt>{{ isCorrection ? 'Total con IVA' : 'Total de Compra c/ IVA' }}</dt>
            <dd>{{ currencyText(totals?.gross) }}</dd>
        </div>
    </dl>
</template>

<style scoped>
.purchase-totals {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    padding: 1rem;
    background: rgba(var(--v-theme-primary), 0.05);
    border-radius: 0.75rem;
}
.purchase-totals dt {
    font-size: 0.8rem;
}
.purchase-totals dd {
    font-size: 1.05rem;
    font-weight: 700;
    margin: 0.3rem 0 0;
}
</style>
