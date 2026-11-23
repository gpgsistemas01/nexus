<script setup lang="ts">
import { computed } from 'vue';
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

const props = defineProps<{
    values: {
        reason: string;
        declaredDelivered: boolean;
    };
    preview: HistoricalDeliveryPreview | null;
    receipt: HistoricalDeliveryReceipt | null;
    selected: string[];
    isWorking: boolean;
    recoveryRequired: boolean;
    canConfirm: boolean;
    error: string;
}>();
const selectedIds = computed(() => new Set(props.selected));

const emit = defineEmits<{
    update: [field: 'reason', value: string];
    declare: [value: boolean];
    select: [id: string];
    selectPage: [];
    clearSelection: [];
    load: [page?: number];
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
        :note="
            !receipt && !recoveryRequired ? `Hasta ${limits.maxDocuments} salidas por lote.` : ''
        "
        @close="emit('close')"
        @submit="emit('confirm')"
    >
        <VAlert
            v-if="!receipt && !recoveryRequired"
            type="info"
            variant="tonal"
            class="mb-4"
        >
            <p>
                Selecciona sólo salidas que ya se entregaron por completo. Si aún queda mercancía
                por entregar, deja la salida pendiente o parcial.
            </p>
            <p class="mt-2">
                La regularización completa el registro de la entrega sin descontar existencias.
                Puedes realizarla antes de ajustar el inventario con el conteo físico. Los costos y
                las cantidades de proyecto históricos quedan sin verificar.
            </p>
        </VAlert>
        <VAlert
            v-if="recoveryRequired"
            type="warning"
            variant="tonal"
            class="mb-4"
        >
            Hay un lote pendiente de confirmación. Retoma el mismo lote para evitar duplicados.
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
            <p role="status">
                {{
                    receipt.documents.length === 1
                        ? 'Se regularizó 1 salida.'
                        : `Se regularizaron ${receipt.documents.length} salidas.`
                }}
                Las existencias siguen sin cambios.
            </p>
            <ul>
                <li
                    v-for="item in receipt.documents"
                    :key="item.id"
                >
                    {{ item.referenceNumber }}
                </li>
            </ul>
            <p class="mt-2">Conserva el recibo {{ receipt.id }}.</p>
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
                    El corte es la fecha y hora en que abriste el diálogo. La selección se conserva
                    al cambiar de página.
                </p>
                <p
                    v-if="preview.total === 0"
                    role="status"
                >
                    No hay salidas con cantidades pendientes de registrar para este corte.
                </p>
                <p
                    v-else-if="!preview.documents.length"
                    role="status"
                >
                    Esta página está vacía. Cambia de página para consultar los resultados.
                </p>
                <div
                    v-if="preview.documents.length || selected.length"
                    class="my-4"
                >
                    <p role="status">
                        {{ selected.length }} de {{ limits.maxDocuments }} salidas seleccionadas.
                        <template v-if="selected.length >= limits.maxDocuments">
                            Lote completo. Confirma el registro o desmarca una salida.
                        </template>
                    </p>
                    <div class="d-flex flex-wrap ga-2 mt-2">
                        <VBtn
                            variant="outlined"
                            :disabled="
                                isWorking ||
                                selected.length >= limits.maxDocuments ||
                                preview.documents.every(({ id }) => selectedIds.has(id))
                            "
                            @click="emit('selectPage')"
                        >
                            Seleccionar de esta página
                        </VBtn>
                        <VBtn
                            variant="text"
                            :disabled="isWorking || !selected.length"
                            @click="emit('clearSelection')"
                        >
                            Limpiar selección
                        </VBtn>
                    </div>
                    <p class="mt-2">
                        La selección de página agrega salidas en el orden de la tabla hasta
                        completar el lote.
                    </p>
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
                        emit('load', $event.page)
                    "
                >
                    <template #[`item.details`]="{ item }">
                        <ul class="historical-details">
                            <li
                                v-for="detail in item.details"
                                :key="detail.id"
                            >
                                <strong>{{ detail.name }}</strong>
                                · Por registrar {{ numberText(detail.pendingQuantity) }} ·
                                Registradas {{ numberText(detail.suppliedQuantity) }} · Devueltas
                                {{ numberText(detail.returnedQuantity) }}
                            </li>
                        </ul>
                    </template>
                    <template #[`item.actions`]="{ item }">
                        <VCheckbox
                            :model-value="selectedIds.has(item.id)"
                            :aria-label="`Seleccionar salida ${item.referenceNumber}`"
                            :disabled="
                                isWorking ||
                                (!selectedIds.has(item.id) &&
                                    selected.length >= limits.maxDocuments)
                            "
                            hide-details
                            @update:model-value="emit('select', item.id)"
                        />
                    </template>
                </ServerTable>
                <div class="historical-fields">
                    <VTextarea
                        :model-value="values.reason"
                        label="Motivo de la regularización"
                        hint="Si tienes un comprobante, incluye su referencia."
                        :maxlength="limits.maxReasonLength"
                        :disabled="isWorking"
                        @update:model-value="emit('update', 'reason', $event ?? '')"
                    />
                    <VCheckbox
                        :model-value="values.declaredDelivered"
                        label="Confirmo que las salidas seleccionadas se entregaron físicamente por completo antes del corte."
                        :disabled="isWorking"
                        @update:model-value="emit('declare', $event === true)"
                    />
                </div>
            </template>
        </template>
    </EditorDialog>
</template>

<style scoped>
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
}
</style>
