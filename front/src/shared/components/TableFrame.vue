<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, onUpdated, ref } from 'vue';
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';
import { VBtn } from 'vuetify/components/VBtn';

withDefaults(
    defineProps<{
        isLoading?: boolean;
        fitColumns?: boolean;
        mobileCards?: boolean;
        details?: boolean;
    }>(),
    {
        isLoading: false,
        fitColumns: false,
        mobileCards: false,
        details: false,
    },
);
const frame = ref<HTMLDivElement | null>(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);
const hasOverflow = computed(() => canScrollLeft.value || canScrollRight.value);
let wrapper: HTMLElement | null = null;
let table: HTMLTableElement | null = null;
let observer: ResizeObserver | undefined;

const updateScroll = () => {
    const left = wrapper?.clientWidth ? wrapper.scrollLeft : 0;
    const remaining = wrapper?.clientWidth ? wrapper.scrollWidth - wrapper.clientWidth - left : 0;
    canScrollLeft.value = left > 1;
    canScrollRight.value = remaining > 1;
};

const observeTable = () => {
    const nextWrapper = frame.value?.querySelector<HTMLElement>('.v-table__wrapper') ?? null;
    const nextTable = nextWrapper?.querySelector('table') ?? null;

    if (nextWrapper !== wrapper || nextTable !== table) {
        observer?.disconnect();
        wrapper = nextWrapper;
        table = nextTable;
        if (wrapper) observer?.observe(wrapper);

        if (table) observer?.observe(table);
    }

    updateScroll();
};

onMounted(() => {
    if (typeof ResizeObserver !== 'undefined') observer = new ResizeObserver(updateScroll);

    observeTable();
});
onUpdated(observeTable);
onBeforeUnmount(() => observer?.disconnect());

const scrollTable = (direction: -1 | 1) => {
    if (!wrapper) return;

    wrapper.scrollBy({
        left: direction * Math.max(wrapper.clientWidth * 0.5, 120),
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
            ? 'instant'
            : 'smooth',
    });
};

const scrollWithKeyboard = (event: KeyboardEvent) => {
    if (!hasOverflow.value || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;

    event.preventDefault();
    scrollTable(event.key === 'ArrowLeft' ? -1 : 1);
};
</script>

<template>
    <div
        ref="frame"
        class="table-frame"
        :class="{
            'table-frame--fit-columns': fitColumns,
            'table-frame--mobile-cards': mobileCards,
            'table-frame--details': details,
            'table-frame--scrollable': hasOverflow,
        }"
        :aria-busy="isLoading"
        :tabindex="fitColumns && hasOverflow ? 0 : undefined"
        :role="fitColumns && hasOverflow ? 'region' : undefined"
        :aria-label="fitColumns && hasOverflow ? 'Tabla con desplazamiento horizontal' : undefined"
        @scroll.capture="updateScroll"
        @keydown.self="scrollWithKeyboard"
    >
        <div
            v-if="fitColumns && hasOverflow"
            class="table-frame__scroll-controls"
            role="group"
            aria-label="Desplazamiento horizontal de la tabla"
        >
            <span>Desplazar columnas</span>
            <VBtn
                size="small"
                variant="outlined"
                :icon="`svg:${mdiChevronLeft}`"
                aria-label="Desplazar tabla a la izquierda"
                :disabled="!canScrollLeft"
                @click="scrollTable(-1)"
            />
            <VBtn
                size="small"
                variant="outlined"
                :icon="`svg:${mdiChevronRight}`"
                aria-label="Desplazar tabla a la derecha"
                :disabled="!canScrollRight"
                @click="scrollTable(1)"
            />
        </div>
        <slot />
    </div>
</template>

<style scoped>
.table-frame {
    min-width: 0;
    border: 1px solid rgb(var(--v-theme-table-border));
    border-radius: 0.75rem;
    background: rgb(var(--v-theme-surface));
    overflow: hidden;
}
.table-frame__scroll-controls {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
    border-bottom: 1px solid rgba(var(--v-theme-table-border), 0.6);
    padding: 0.35rem 0.65rem;
    color: rgb(var(--v-theme-muted));
    font-size: 0.75rem;
}
.table-frame :deep(.v-table .v-table__wrapper th) {
    color: var(--table-header-text, white);
    font-weight: 700;
    font-size: 0.8rem;
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
.table-frame :deep(th .v-data-table-header__sort-icon) {
    opacity: 1;
    flex-shrink: 0;
}
.table-frame :deep(th .v-data-table-header__content) {
    justify-content: center;
}
.table-frame :deep(thead tr:not(:first-child)) {
    --table-header-text: rgb(var(--v-theme-table-child-text));
    --table-header-background: rgb(var(--v-theme-table-child-header));
    --table-header-border: rgb(var(--v-theme-table-child-border));
}
.table-frame :deep(.v-table .v-table__wrapper thead tr:not(:first-child) th) {
    color: var(--table-header-text) !important;
    background: var(--table-header-background) !important;
    border-bottom-color: var(--table-header-border) !important;
}
.table-frame :deep(.v-table td) {
    background: var(--table-row-highlight, rgb(var(--v-theme-surface)));
    color: rgb(var(--v-theme-on-surface));
    font-size: 0.85rem;
    font-weight: 500;
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
.table-frame:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: -2px;
}
.table-frame--fit-columns :deep(.v-table__wrapper) {
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scrollbar-color: rgb(var(--v-theme-primary)) rgb(var(--v-theme-table-alt));
}
.table-frame--fit-columns :deep(.v-table__wrapper > table) {
    width: max-content;
    min-width: 100%;
}
.table-frame--fit-columns :deep(.v-table__wrapper td),
.table-frame--fit-columns :deep(.v-table__wrapper th) {
    max-width: 18rem;
    font-size: 0.875rem;
    line-height: 1.4;
    white-space: normal;
}
.table-frame--fit-columns :deep(.v-table__wrapper td) {
    overflow-wrap: anywhere;
}
.table-frame--fit-columns :deep(td.v-data-table-column--align-end) {
    text-align: end;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
}
.table-frame--fit-columns :deep(.v-data-table-header__content) {
    white-space: normal;
}
.table-frame--fit-columns:not(.table-frame--scrollable) :deep(.v-data-table-column--fixed),
.table-frame--fit-columns:not(.table-frame--scrollable) :deep(.v-data-table-column--fixed-end) {
    position: static;
}
.table-frame--fit-columns.table-frame--scrollable :deep(.v-data-table-column--fixed),
.table-frame--fit-columns.table-frame--scrollable :deep(.v-data-table-column--fixed-end) {
    position: sticky;
    z-index: 2;
}
.table-frame--fit-columns.table-frame--scrollable :deep(.v-data-table-column--fixed) {
    inset-inline-start: 0;
}
.table-frame--fit-columns.table-frame--scrollable :deep(.v-data-table-column--fixed-end) {
    inset-inline-end: 0;
}
.table-frame--fit-columns.table-frame--scrollable :deep(thead .v-data-table-column--fixed),
.table-frame--fit-columns.table-frame--scrollable :deep(thead .v-data-table-column--fixed-end) {
    z-index: 4;
}
@media (max-width: 599px) {
    .table-frame--mobile-cards :deep(.v-table__wrapper) {
        display: none;
    }
}
/* Las partidas conservan anchos legibles; el desplazamiento queda dentro del marco. */
.table-frame--details {
    font-family: var(--v-font-table);
}
@media (min-width: 600px) {
    .table-frame--details .table-frame__scroll-controls {
        display: flex;
    }
    .table-frame--details :deep(.v-table__wrapper) {
        overflow-x: auto !important;
        overscroll-behavior-x: contain;
        scroll-padding-inline: 20rem 7rem;
    }
    .table-frame--details :deep(.v-table__wrapper > table) {
        width: max-content !important;
        min-width: 100% !important;
        table-layout: auto;
    }
    .table-frame--details :deep(.v-table .v-table__wrapper th),
    .table-frame--details :deep(.v-table__wrapper td) {
        min-width: 6.5rem !important;
        max-width: 14rem;
        padding: 0.65rem 0.75rem;
        font-size: 0.875rem;
        line-height: 1.45;
        overflow-wrap: normal;
        word-break: normal;
        white-space: normal !important;
        text-align: start;
    }
    .table-frame--details :deep(.v-table__wrapper th[colspan]:not([colspan='1'])) {
        text-align: center;
        max-width: none;
    }
    .table-frame--details :deep(thead tr:first-child th:first-child),
    .table-frame--details :deep(.v-table__wrapper td:first-child) {
        min-width: 16rem !important;
        max-width: 20rem;
        overflow-wrap: break-word;
    }
    .table-frame--details :deep(.v-table__wrapper th:last-child),
    .table-frame--details :deep(.v-table__wrapper td:last-child) {
        width: auto;
    }
    .table-frame--details :deep(th .v-data-table-header__content) {
        justify-content: flex-start;
        overflow-wrap: normal;
    }
    .table-frame--details :deep(th .v-data-table-header__content > span:first-child) {
        min-inline-size: min-content;
        max-inline-size: 12ch;
        text-wrap: balance;
    }
    .table-frame--details :deep(th[colspan]:not([colspan='1']) .v-data-table-header__content),
    .table-frame--details
        :deep(th.v-data-table-column--align-center .v-data-table-header__content) {
        justify-content: center;
    }
    .table-frame--details :deep(th.v-data-table-column--align-end .v-data-table-header__content) {
        justify-content: flex-end;
    }
    .table-frame--details :deep(.v-table__wrapper .v-data-table-column--align-end) {
        text-align: end;
        font-variant-numeric: tabular-nums lining-nums slashed-zero;
    }
    .table-frame--details :deep(td.v-data-table-column--align-end) {
        white-space: nowrap !important;
        overflow-wrap: normal;
    }
    .table-frame--details :deep(.v-table__wrapper .v-data-table-column--align-center) {
        text-align: center;
    }
    .table-frame--details :deep(.v-table__wrapper td .v-input) {
        min-width: 9rem;
    }
    .table-frame--details :deep(.v-table__wrapper td .v-input:has(input[type='number'])) {
        min-width: 0;
        inline-size: 8rem;
        max-inline-size: 100%;
    }
    .table-frame--details :deep(input[type='number']) {
        text-align: end;
        font-variant-numeric: tabular-nums lining-nums slashed-zero;
    }
    .table-frame--details :deep(.v-data-table-column--fixed),
    .table-frame--details :deep(.v-data-table-column--fixed-end) {
        position: sticky !important;
        z-index: 2;
    }
    .table-frame--details :deep(.v-data-table-column--fixed) {
        inset-inline-start: 0 !important;
    }
    .table-frame--details :deep(.v-data-table-column--fixed-end) {
        inset-inline-end: 0 !important;
    }
    .table-frame--details :deep(thead .v-data-table-column--fixed),
    .table-frame--details :deep(thead .v-data-table-column--fixed-end) {
        z-index: 4;
    }
}
@media (min-width: 600px) and (max-width: 899px) {
    .table-frame--details :deep(thead tr:first-child th:first-child),
    .table-frame--details :deep(.v-table__wrapper td:first-child) {
        min-width: 12rem !important;
        max-width: 14rem;
    }
    .table-frame--details :deep(.v-table__wrapper) {
        scroll-padding-inline: 14rem 7rem;
    }
}
@media (max-width: 599px) {
    .table-frame--entry :deep(.v-table__wrapper) {
        display: block;
    }
    .table-frame--entry :deep(.v-table__wrapper > table),
    .table-frame--entry :deep(.v-table__wrapper > table > tbody) {
        display: block;
        width: 100%;
    }
    .table-frame--entry :deep(thead),
    .table-frame--entry :deep(tbody > tr:not(.detail-entry)) {
        display: none;
    }
}
</style>
