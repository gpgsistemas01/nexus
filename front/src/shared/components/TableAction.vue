<script setup lang="ts">
import { VBtn } from 'vuetify/components/VBtn';
import { VIcon } from 'vuetify/components/VIcon';
import { VTooltip } from 'vuetify/components/VTooltip';

withDefaults(defineProps<{ label: string; icon: string; color?: string; isDisabled?: boolean }>(), {
    color: 'filter-action',
    isDisabled: false,
});
const emit = defineEmits<{ click: [] }>();
</script>

<template>
    <VBtn
        class="table-action"
        :color="color"
        :disabled="isDisabled"
        size="x-small"
        icon
        :aria-label="label"
        variant="flat"
        @click="emit('click')"
    >
        <VIcon :icon="icon" />
        <VTooltip activator="parent">{{ label }}</VTooltip>
    </VBtn>
</template>

<style scoped>
.table-action {
    margin: 0.125rem;
    border: 1px solid rgba(255, 255, 255, 0.35);
    box-shadow: 0 0.2rem 0.45rem rgba(var(--v-theme-on-surface), 0.16);
}
.table-action:focus-visible {
    outline: 3px solid rgb(var(--v-theme-filter-action));
    outline-offset: 3px;
}
</style>
