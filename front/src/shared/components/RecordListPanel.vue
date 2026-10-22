<script setup lang="ts">
import { VCard, VCardText } from 'vuetify/components/VCard';
import { VAlert } from 'vuetify/components/VAlert';
import { VBtn } from 'vuetify/components/VBtn';
import ListFilters from './ListFilters.vue';

withDefaults(
    defineProps<{
        title: string;
        titleId: string;
        total: number;
        isLoading: boolean;
        error: string;
        loadingLabel?: string;
        titlePrefix?: string;
        hideSearch?: boolean;
        hasActiveFilters?: boolean;
        showCount?: boolean;
        isRefreshing?: boolean;
    }>(),
    {
        loadingLabel: 'Cargando registros…',
        titlePrefix: 'Tabla de',
        hideSearch: false,
        hasActiveFilters: false,
        showCount: true,
        isRefreshing: false,
    },
);
const emit = defineEmits<{ search: []; clear: []; refresh: [] }>();
const search = defineModel<string>('search', { required: true });
</script>

<template>
    <ListFilters
        v-if="!hideSearch"
        v-model:search="search"
        :is-loading="isLoading"
        :has-extra-filters="!!$slots.filters"
        :has-active-filters="!!search || hasActiveFilters"
        @apply="emit('search')"
        @clear="emit('clear')"
        @refresh="emit('refresh')"
    >
        <slot name="filters" />
    </ListFilters>
    <section :aria-labelledby="titleId">
        <VCard class="record-sheet">
            <VCardText>
                <header class="record-heading">
                    <h1 :id="titleId">{{ titlePrefix }} {{ title }}</h1>
                    <div class="record-actions"><slot name="actions" /></div>
                </header>
                <VAlert
                    v-if="error"
                    type="error"
                    role="alert"
                    variant="tonal"
                    class="mb-4"
                >
                    {{ error }}
                    <VBtn
                        variant="text"
                        @click="emit('refresh')"
                    >
                        Reintentar
                    </VBtn>
                </VAlert>
                <slot name="messages" />
                <p
                    v-if="showCount"
                    class="record-count"
                    role="status"
                >
                    {{ isLoading ? loadingLabel : `Registros encontrados: ${total}` }}
                    <span v-if="isRefreshing">· Actualizando datos…</span>
                </p>
                <slot />
            </VCardText>
        </VCard>
    </section>
</template>

<style scoped>
.record-sheet {
    border: 1px solid rgba(var(--v-theme-table-header), 0.16);
    border-radius: 1.25rem;
    background: linear-gradient(
        180deg,
        rgb(var(--v-theme-surface)),
        rgb(var(--v-theme-background))
    );
    box-shadow: 0 1rem 2.25rem rgba(var(--v-theme-on-surface), 0.08);
}
.record-sheet > :deep(.v-card-text) {
    padding: clamp(1rem, 2vw, 1.5rem);
}
.record-heading,
.record-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.65rem;
}
.record-heading {
    justify-content: space-between;
    margin-bottom: 1.25rem;
}
.record-heading h1 {
    flex: 1 1 15rem;
    font-size: clamp(1.35rem, 2vw, 1.75rem);
    color: rgb(var(--v-theme-on-surface));
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    line-height: 1.3;
    text-align: center;
}
.record-count {
    color: rgb(var(--v-theme-muted));
    font-size: 0.75rem;
    margin-bottom: 0.6rem;
}
@media (max-width: 600px) {
    .record-actions,
    .record-actions :deep(.v-btn) {
        flex: 1 1 100%;
    }
}
</style>
