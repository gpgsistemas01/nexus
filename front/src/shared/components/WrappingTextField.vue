<script setup lang="ts">
import { getReadOnlyFieldProps } from '../ui/readOnlyField.js';
import { VTextarea } from 'vuetify/components/VTextarea';

defineProps<{ readonly?: boolean }>();

const model = defineModel<string>({
    required: true,
    set: (value) => value.replace(/[\r\n]/g, ''),
});

const submitOnEnter = (event: KeyboardEvent) => {
    if (
        event.isComposing ||
        event.defaultPrevented ||
        !(event.target instanceof HTMLTextAreaElement)
    )
        return;

    event.preventDefault();
    if (event.target.readOnly) return;

    const submitButton = Array.from(event.target.form?.elements ?? []).find(
        (element): element is HTMLButtonElement =>
            element instanceof HTMLButtonElement && element.type === 'submit',
    );
    submitButton?.click();
};
</script>

<template>
    <VTextarea
        class="wrapping-text-field"
        :model-value="model"
        v-bind="getReadOnlyFieldProps(readonly)"
        :rows="1"
        auto-grow
        no-resize
        @update:model-value="model = $event ?? ''"
        @keydown.enter="submitOnEnter"
    />
</template>

<style scoped>
.wrapping-text-field :deep(textarea) {
    overflow-wrap: anywhere;
}
</style>
