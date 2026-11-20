<script setup lang="ts">
defineProps<{
    label: string;
    fields: { label: string; value: string }[];
}>();
</script>

<template>
    <dl
        class="record-totals"
        :aria-label="label"
    >
        <div
            v-for="field in fields"
            :key="field.label"
        >
            <dt>{{ field.label }}</dt>
            <dd>{{ field.value }}</dd>
        </div>
    </dl>
</template>

<style scoped>
.record-totals {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    padding: 1rem;
    background: rgba(var(--v-theme-primary), 0.05);
    border-radius: 0.75rem;
}
.record-totals dt {
    font-size: 0.8rem;
}
.record-totals dd {
    font-size: 1.05rem;
    font-weight: 700;
    margin: 0.3rem 0 0;
}
</style>
