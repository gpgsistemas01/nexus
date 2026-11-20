<script setup lang="ts">
import { computed } from 'vue';
import { VTextField } from 'vuetify/components/VTextField';

const props = defineProps<{ type: 'date' | 'datetime-local' | 'month' }>();
const value = defineModel<string>({ required: true });

const display = computed(() => {
    const [date = '', time] = value.value.split('T');
    const [year, month, day] = date.split('-');
    if (props.type === 'month') return year && month ? `${month}/${year}` : 'mm/aaaa';

    if (!year || !month || !day) return props.type === 'date' ? 'dd/mm/aaaa' : 'dd/mm/aaaa hh:mm';

    const dateText = `${day}/${month}/${year}`;
    return time ? `${dateText} ${time.slice(0, 5)}` : dateText;
});
</script>

<template>
    <VTextField
        :type="type"
        :model-value="value"
        class="date-field"
        lang="es-MX"
        @update:model-value="value = $event ?? ''"
    >
        <span
            class="date-field-display"
            :class="{ 'date-field-placeholder': !value }"
            aria-hidden="true"
        >
            {{ display }}
        </span>
    </VTextField>
</template>

<style scoped>
.date-field :deep(.v-field__input) {
    display: grid;
    grid-template-areas: 'date';
    align-items: center;
    font-variant-numeric: tabular-nums;
}

.date-field :deep(input),
.date-field-display {
    grid-area: date;
    min-inline-size: 0;
}

.date-field-display {
    pointer-events: none;
    padding-inline-end: 1.5rem;
}

.date-field-placeholder {
    color: rgb(var(--v-theme-muted));
}

.date-field:not(:focus-within) :deep(input) {
    color: transparent;
}

.date-field:not(:focus-within) :deep(input::-webkit-datetime-edit) {
    opacity: 0;
}

.date-field:focus-within .date-field-display {
    visibility: hidden;
}
</style>
