<script setup lang="ts">
import { VAlert } from 'vuetify/components/VAlert';
import { VBtn } from 'vuetify/components/VBtn';
import { VCheckbox } from 'vuetify/components/VCheckbox';
import { VTextarea } from 'vuetify/components/VTextarea';
import type { DataTableHeader } from 'vuetify';
import { HISTORICAL_DELIVERY_LIMITS as limits } from '@nexus/historical-deliveries';
import EditorDialog from '../../../shared/components/EditorDialog.vue';
import ServerTable from '../../../shared/components/ServerTable.vue';
import { numberText } from '../../../shared/utils/formatNumbers.js';
import type {
    HistoricalDeliveryPreview,
    HistoricalDeliveryCandidate,
    HistoricalDeliveryReceipt,
} from '../historicalDelivery.js';

defineProps<{
    values: {
        reason: string;
        declaredDelivered: boolean;
    };
    preview: HistoricalDeliveryPreview | null;
    receipt: HistoricalDeliveryReceipt | null;
    selected: string[];
    allSelected: boolean;
    isWorking: boolean;
    isSelectingAll: boolean;
    recoveryRequired: boolean;
    canConfirm: boolean;
    error: string;
}>();
const emit = defineEmits<{
    update: [field: 'reason', value: string];
    declare: [value: boolean];
    select: [id: string];
    selectAll: [selected: boolean];
    load: [page?: number, preserveSelection?: boolean];
    confirm: [];
    recover: [];
    close: [];
}>();
const deliveryHeaders: DataTableHeader<HistoricalDeliveryCandidate>[] = [
    { title: 'Folio', key: 'referenceNumber', sortable: false },
    { title: 'Área', key: 'departmentName', sortable: false },
    { title: 'Proyecto', key: 'projectNumber', sortable: false },
    { title: 'Partidas pendientes', key: 'details', sortable: false },
    { title: 'Acciones', key: 'actions', sortable: false },
];
</script>

<template>
    <EditorDialog
        title="Registrar entregas históricas"
        :is-submitting="isWorking"
        :show-submit="!receipt && !recoveryRequired"
        :is-submit-disabled="!canConfirm"
        submit-label="Registrar entregas seleccionadas"
        :message="error"
        note="Hasta 100 salidas por lote. Conserva el recibo de regularización."
        @close="emit('close')"
        @submit="emit('confirm')"
    >
        <VAlert
            type="info"
            variant="tonal"
            class="mb-4"
        >
            La tabla muestra automáticamente salidas pendientes y parcialmente surtidas hasta la
            hora actual. Usa este registro sólo para entregas físicas ya realizadas. Primero
            concilia el inventario con un conteo físico actual. Esta operación completa el registro
            pendiente sin descontar stock. Los costos y cantidades de proyecto históricos permanecen
            sin verificar. No se captura una fecha real única porque las salidas pueden haberse
            entregado en momentos distintos; el sistema registra cuándo se realiza esta
            regularización.
        </VAlert>
        <VAlert
            v-if="recoveryRequired"
            type="warning"
            variant="tonal"
            class="mb-4"
        >
            Hay una confirmación pendiente. El reintento conserva la captura y su clave para evitar
            duplicados.
            <VBtn
                variant="outlined"
                :disabled="isWorking"
                class="mt-2"
                @click="emit('recover')"
            >
                Revisar y reintentar registro
            </VBtn>
        </VAlert>
        <VAlert
            v-if="receipt"
            type="success"
            variant="tonal"
            class="mb-4"
        >
            Se registraron {{ receipt.documents.length }} entregas. Recibo: {{ receipt.id }}. El
            inventario conserva sus existencias.
            <ul>
                <li
                    v-for="item in receipt.documents"
                    :key="item.id"
                >
                    {{ item.referenceNumber }}
                </li>
            </ul>
        </VAlert>
        <template v-if="!receipt && !recoveryRequired">
            <p
                v-if="isWorking && !preview"
                role="status"
            >
                Cargando salidas pendientes y parcialmente surtidas…
            </p>
            <template v-if="preview">
                <p>
                    Revisa las partidas pendientes y selecciona sólo las salidas entregadas por
                    completo. La selección se conserva al cambiar de página.
                </p>
                <p
                    v-if="preview.total === 0"
                    role="status"
                >
                    No hay salidas pendientes ni parcialmente surtidas para este corte.
                </p>
                <p
                    v-else-if="!preview.documents.length"
                    role="status"
                >
                    No hay salidas pendientes ni parcialmente surtidas en esta página. Puedes
                    avanzar o seleccionar los resultados de todas las páginas.
                </p>
                <template v-if="preview.documents.length || preview.hasMore">
                    <div class="my-4">
                        <span>
                            {{ selected.length }}
                            {{
                                selected.length === 1
                                    ? 'salida seleccionada'
                                    : 'salidas seleccionadas'
                            }}
                            en todas las páginas (máximo {{ limits.maxDocuments }} por lote).
                        </span>
                    </div>
                </template>
                <div
                    v-if="preview.documents.length"
                    class="historical-select-all-cards"
                >
                    <VCheckbox
                        :model-value="allSelected"
                        :indeterminate="selected.length > 0 && !allSelected"
                        aria-label="Seleccionar todas las salidas de todas las páginas"
                        :disabled="isWorking || isSelectingAll"
                        :loading="isSelectingAll"
                        hide-details
                        @update:model-value="emit('selectAll', $event === true)"
                    />
                </div>
                <ServerTable
                    :headers="deliveryHeaders"
                    :rows="preview.documents"
                    :total="preview.total"
                    :page="preview.page"
                    :page-size="limits.pageSize"
                    :page-size-options="[limits.pageSize]"
                    :is-loading="isWorking"
                    table-label="Salidas pendientes y parcialmente surtidas"
                    @options="
                        $event.page !== preview.page &&
                        $event.page <= limits.maxPage &&
                        !isWorking &&
                        emit('load', $event.page, true)
                    "
                >
                    <template #[`header.actions`]>
                        <VCheckbox
                            :model-value="allSelected"
                            :indeterminate="selected.length > 0 && !allSelected"
                            aria-label="Seleccionar todas las salidas de todas las páginas"
                            :disabled="isWorking || isSelectingAll"
                            :loading="isSelectingAll"
                            hide-details
                            @update:model-value="emit('selectAll', $event === true)"
                        />
                    </template>
                    <template #[`item.details`]="{ item }">
                        <ul class="historical-details">
                            <li
                                v-for="detail in item.details"
                                :key="detail.id"
                            >
                                {{ detail.name }}: {{ numberText(detail.pendingQuantity) }} por
                                registrar; {{ numberText(detail.suppliedQuantity) }} ya registradas
                                y {{ numberText(detail.returnedQuantity) }} devueltas.
                            </li>
                        </ul>
                    </template>
                    <template #[`item.actions`]="{ item }">
                        <VCheckbox
                            :model-value="selected.includes(item.id)"
                            :aria-label="`Seleccionar salida ${item.referenceNumber}`"
                            :disabled="isWorking"
                            hide-details
                            @update:model-value="emit('select', item.id)"
                        />
                    </template>
                </ServerTable>
                <div class="historical-fields">
                    <VTextarea
                        :model-value="values.reason"
                        label="Motivo y evidencia de la entrega histórica"
                        :maxlength="limits.maxReasonLength"
                        :disabled="isWorking"
                        @update:model-value="emit('update', 'reason', $event ?? '')"
                    />
                    <VCheckbox
                        :model-value="values.declaredDelivered"
                        label="Confirmo que todas las partidas pendientes seleccionadas ya se entregaron físicamente antes del corte."
                        :disabled="isWorking"
                        @update:model-value="emit('declare', $event === true)"
                    />
                </div>
            </template>
        </template>
    </EditorDialog>
</template>

<style scoped>
.historical-select-all-cards {
    display: none;
}
.historical-fields {
    display: grid;
    gap: 1rem;
}
.historical-details {
    min-width: 16rem;
    padding-inline-start: 1rem;
}
@media (max-width: 599px) {
    .historical-details {
        min-width: 0;
    }
    .historical-select-all-cards {
        display: block;
    }
}
</style>
