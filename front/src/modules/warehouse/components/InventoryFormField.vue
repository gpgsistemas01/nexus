<script setup lang="ts">
import { VTextField } from 'vuetify/components/VTextField';
import { VTextarea } from 'vuetify/components/VTextarea';
import { VCheckbox } from 'vuetify/components/VCheckbox';
import RemoteSelect from '../../../shared/components/RemoteSelect.vue';
import type { InventoryFieldSpec } from '../formFields.js';
import type { LookupState } from '../../../shared/lookup.js';

const props = defineProps<{
    field: InventoryFieldSpec;
    value: string | boolean;
    error?: string;
    isDisabled: boolean;
    lookup?: LookupState;
}>();
const emit = defineEmits<{
    update: [value: string | boolean];
    blur: [];
    search: [value: string];
    more: [];
    retry: [];
}>();

const update = (value: string | boolean) => {
    if (!props.field.isReadOnly) emit('update', value);
};
</script>

<template>
    <RemoteSelect
        v-if="field.type === 'lookup'"
        :label="field.label"
        :model-value="String(value)"
        :items="lookup?.items ?? []"
        :is-loading="lookup?.isLoading ?? false"
        :error="error"
        :load-error="lookup?.error"
        :has-more="lookup?.hasMore"
        :is-disabled="isDisabled || field.isDisabled"
        :hint="field.hint"
        @update:model-value="update"
        @search="emit('search', $event)"
        @more="emit('more')"
        @retry="emit('retry')"
        @blur="emit('blur')"
    />
    <VCheckbox
        v-else-if="field.type === 'checkbox'"
        :label="field.label"
        :model-value="!!value"
        :disabled="isDisabled || field.isReadOnly"
        :error-messages="error"
        @update:model-value="update($event === true)"
    />
    <VTextarea
        v-else-if="field.type === 'textarea'"
        :label="field.label"
        :name="field.name"
        :model-value="String(value)"
        :disabled="isDisabled"
        :error-messages="error"
        rows="2"
        auto-grow
        @update:model-value="update($event ?? '')"
        @blur="emit('blur')"
    />
    <VTextField
        v-else
        :label="field.label"
        :aria-label="field.label"
        :name="field.name"
        :type="field.type === 'number' ? 'number' : 'text'"
        :model-value="field.displayValue ?? String(value)"
        :readonly="field.isReadOnly"
        :class="{ 'consultation-field': field.isReadOnly }"
        :disabled="isDisabled"
        :error-messages="error"
        :hint="field.hint"
        :step="field.type === 'number' ? 'any' : undefined"
        @update:model-value="update($event ?? '')"
        @blur="!field.isReadOnly && emit('blur')"
    />
</template>

<style scoped>
.consultation-field :deep(.v-field) {
    background: rgba(var(--v-theme-on-surface), 0.04);
}
</style>
