<script setup lang="ts">
import { VCard, VCardText } from 'vuetify/components/VCard';
import { VTextField } from 'vuetify/components/VTextField';
import { VAlert } from 'vuetify/components/VAlert';
import { VBtn } from 'vuetify/components/VBtn';
import FilterActions from './FilterActions.vue';

defineProps<{ title: string; titleId: string; total: number; isLoading: boolean; error: string }>();
const emit = defineEmits<{ search: []; clear: []; refresh: [] }>();
const search = defineModel<string>('search', { required: true });
</script>

<template>
    <section :aria-labelledby="titleId">
        <VCard class="record-sheet">
            <VCardText>
                <header class="record-heading">
                    <h1 :id="titleId">Tabla de {{ title }}</h1>
                    <div class="record-actions"><slot name="actions" /></div>
                </header>
                <form
                    class="record-search"
                    @submit.prevent="emit('search')"
                >
                    <VTextField
                        v-model="search"
                        label="Buscar por nombre"
                        clearable
                        @click:clear="
                            search = '';
                            emit('search');
                        "
                    />
                    <slot name="filters" />
                    <FilterActions
                        :is-loading="isLoading"
                        @clear="emit('clear')"
                        @refresh="emit('refresh')"
                    />
                </form>
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
                    class="record-count"
                    role="status"
                >
                    {{ isLoading ? 'Cargando registros…' : `Registros encontrados: ${total}` }}
                </p>
                <slot />
            </VCardText>
        </VCard>
    </section>
</template>

<style scoped>
.record-sheet {
    border: 1px solid rgba(var(--v-theme-primary), 0.16);
    border-radius: 1.25rem;
    box-shadow: 0 1rem 2.25rem rgba(var(--v-theme-on-surface), 0.08);
}
.record-sheet > :deep(.v-card-text) {
    padding: clamp(1rem, 2vw, 1.5rem);
}
.record-heading,
.record-actions,
.record-search {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.65rem;
}
.record-heading {
    justify-content: space-between;
    margin-bottom: 1.5rem;
}
.record-heading h1 {
    flex: 1 1 15rem;
    font-size: clamp(1.35rem, 2vw, 1.75rem);
    font-weight: 800;
    text-align: center;
}
.record-search {
    align-items: flex-start;
    margin-bottom: 1rem;
}
.record-search :deep(.v-input) {
    flex: 1 1 220px;
}
.record-count {
    color: rgb(var(--v-theme-muted));
    font-size: 0.8rem;
    margin-bottom: 0.6rem;
}
@media (max-width: 600px) {
    .record-search :deep(.filter-actions),
    .record-actions {
        flex: 1 1 100%;
    }
    .record-actions :deep(.v-btn) {
        flex: 1 1 120px;
    }
}
</style>
