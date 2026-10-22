<script setup lang="ts">
withDefaults(defineProps<{ isLoading?: boolean }>(), { isLoading: false });
</script>

<template>
    <div
        class="table-frame"
        :aria-busy="isLoading"
    >
        <slot />
    </div>
</template>

<style scoped>
.table-frame {
    min-width: 0;
    border: 1px solid rgb(var(--v-theme-table-border));
    border-radius: 0.75rem;
    background: white;
    overflow: hidden;
}
.table-frame :deep(.v-table .v-table__wrapper th) {
    color: var(--table-header-text, white);
    font-weight: 700;
    font-size: 0.76rem;
    border-right: 1px solid rgba(255, 255, 255, 0.2);
    border-bottom: 2px solid var(--table-header-border, rgb(var(--v-theme-table-header-hover)));
    background: var(
        --table-header-background,
        linear-gradient(
            180deg,
            rgb(var(--v-theme-table-header-top)),
            rgb(var(--v-theme-table-header))
        )
    ) !important;
    text-align: center;
}
.table-frame :deep(.v-table .v-table__wrapper th:hover) {
    background: var(--table-header-background, rgb(var(--v-theme-table-header-hover))) !important;
}
.table-frame :deep(th .v-icon) {
    color: var(--table-header-text, white);
}
.table-frame :deep(th .v-data-table-header__content) {
    justify-content: center;
}
.table-frame :deep(thead tr:not(:first-child)) {
    --table-header-text: rgb(var(--v-theme-table-child-text));
    --table-header-background: rgb(var(--v-theme-table-child-header));
    --table-header-border: rgb(var(--v-theme-table-child-border));
}
.table-frame :deep(.v-table td) {
    background: var(--table-row-highlight, rgb(var(--v-theme-surface)));
    font-size: 0.8rem;
    border-right: 1px solid rgba(var(--v-theme-table-border), 0.45);
    border-bottom: 1px solid rgba(var(--v-theme-table-border), 0.6);
    text-align: center;
    vertical-align: middle;
    padding: 0.65rem 0.75rem;
}
.table-frame :deep(tbody tr:nth-child(even) td) {
    background: var(--table-row-highlight, rgb(var(--v-theme-table-alt)));
}
.table-frame :deep(tbody tr:hover td) {
    background: var(--table-row-highlight, rgb(var(--v-theme-table-hover)));
}
.table-frame :deep(tbody tr:focus-within td) {
    background: var(--table-row-highlight, rgb(var(--v-theme-table-hover)));
}
.table-frame :deep(.v-data-table-footer) {
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0.65rem;
    font-size: 0.75rem;
    border-top: 1px solid rgba(var(--v-theme-table-border), 0.6);
}
.table-frame :deep(.v-data-table-footer__pagination .v-btn) {
    border: 1px solid rgb(var(--v-theme-table-border));
    background: rgb(var(--v-theme-surface));
    color: rgb(var(--v-theme-primary));
    box-shadow: 0 0.2rem 0.45rem rgba(var(--v-theme-on-surface), 0.08);
    margin-inline: 0.15rem;
}
.table-frame :deep(.v-data-table-footer__pagination .v-btn:disabled) {
    opacity: 0.4;
    box-shadow: none;
}
</style>
