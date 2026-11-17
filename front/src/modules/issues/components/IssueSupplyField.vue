<script setup lang="ts">
import { computed } from 'vue';
import { VCheckbox } from 'vuetify/components/VCheckbox';
import { VTextField } from 'vuetify/components/VTextField';
import { isPiecePresentation } from '@nexus/piece-quantity';
import { getIssuePendingQuantity } from '../issueRules.js';
import type { IssueDetail, IssueSupplyChanges } from '../issue.js';
import { convertedQuantityText, numberText } from '../../../shared/utils/formatNumbers.js';

const props = defineProps<{
    field: 'quantityToSupply' | 'projectConvertedQuantity' | 'supply';
    item: IssueDetail;
    isDisabled: boolean;
}>();
const emit = defineEmits<{ supply: [changes: IssueSupplyChanges] }>();
const pendingQuantity = computed(() => getIssuePendingQuantity(props.item));
const projectValue = computed(() =>
    props.item.isOriginallySupplied && props.item.projectConvertedQuantity !== ''
        ? convertedQuantityText(props.item.projectConvertedQuantity, props.item.unitMeasure, {
              useGrouping: false,
          })
        : props.item.projectConvertedQuantity,
);
</script>

<template>
    <template v-if="field === 'quantityToSupply'">
        <VTextField
            v-if="pendingQuantity > 0"
            :aria-label="`Cantidad a surtir: ${item.name}`"
            type="number"
            :min="isPiecePresentation(item.presentation) ? 1 : 0.01"
            :step="isPiecePresentation(item.presentation) ? 1 : 0.01"
            :max="pendingQuantity"
            :model-value="item.quantityToSupply"
            :hint="`Pendiente: ${numberText(pendingQuantity)} ${item.presentation}`"
            persistent-hint
            :disabled="
                isDisabled || item.isOriginallySupplied || item.isCanceled || !item.isSupplied
            "
            @update:model-value="emit('supply', { quantityToSupply: $event ?? '' })"
        />
        <span v-else>Completamente surtido</span>
    </template>
    <VTextField
        v-else-if="field === 'projectConvertedQuantity'"
        :aria-label="`Cantidad de proyecto: ${item.name}`"
        type="number"
        min="0.01"
        step="0.01"
        :model-value="projectValue"
        :disabled="isDisabled || item.isOriginallySupplied || item.isCanceled || !item.isSupplied"
        hide-details
        @update:model-value="emit('supply', { projectConvertedQuantity: $event ?? '' })"
    />
    <VCheckbox
        v-else
        :aria-label="`Surtir: ${item.name}`"
        :model-value="item.isSupplied"
        :disabled="isDisabled || item.isOriginallySupplied || item.isCanceled"
        hide-details
        @update:model-value="emit('supply', { isSupplied: $event === true })"
    />
</template>
