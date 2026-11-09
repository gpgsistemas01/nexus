<script setup lang="ts">
import { VAlert } from 'vuetify/components/VAlert';
import { VBtn } from 'vuetify/components/VBtn';
import { VCheckbox } from 'vuetify/components/VCheckbox';
import { VTable } from 'vuetify/components/VTable';
import { VTextField } from 'vuetify/components/VTextField';
import { VTextarea } from 'vuetify/components/VTextarea';
import { HISTORICAL_DELIVERY_LIMITS as limits } from '@nexus/historical-deliveries';
import EditorDialog from '../../../shared/components/EditorDialog.vue';
import TableFrame from '../../../shared/components/TableFrame.vue';
import { numberText } from '../../../shared/utils/formatNumbers.js';
import type {
    HistoricalDeliveryPreview,
    HistoricalDeliveryReceipt,
} from '../historicalDelivery.js';

defineProps<{
    values: {
        deliveredAt: string;
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
    update: [field: 'deliveredAt' | 'reason', value: string];
    declare: [value: boolean];
    select: [id: string];
    selectAll: [selected: boolean];
    load: [page?: number, preserveSelection?: boolean];
    confirm: [];
    recover: [];
    close: [];
}>();
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
            sin verificar.
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
                    v-if="!preview.documents.length && !preview.hasMore"
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
                <template v-if="preview.documents.length">
                    <TableFrame>
                        <VTable
                            density="compact"
                            aria-label="Salidas pendientes y parcialmente surtidas"
                        >
                            <thead>
                                <tr>
                                    <th scope="col">
                                        <VCheckbox
                                            :model-value="allSelected"
                                            :indeterminate="selected.length > 0 && !allSelected"
                                            aria-label="Seleccionar todas las salidas de todas las páginas"
                                            :disabled="isWorking || isSelectingAll"
                                            :loading="isSelectingAll"
                                            hide-details
                                            @update:model-value="emit('selectAll', $event === true)"
                                        />
                                    </th>
                                    <th scope="col">Folio</th>
                                    <th scope="col">Área</th>
                                    <th scope="col">Proyecto</th>
                                    <th scope="col">Partidas pendientes</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    v-for="item in preview.documents"
                                    :key="item.id"
                                >
                                    <td>
                                        <VCheckbox
                                            :model-value="selected.includes(item.id)"
                                            :aria-label="`Seleccionar salida ${item.referenceNumber}`"
                                            :disabled="isWorking"
                                            hide-details
                                            @update:model-value="emit('select', item.id)"
                                        />
                                    </td>
                                    <td>{{ item.referenceNumber }}</td>
                                    <td>{{ item.departmentName }}</td>
                                    <td>{{ item.projectNumber }}</td>
                                    <td class="text-start">
                                        <ul class="historical-details">
                                            <li
                                                v-for="detail in item.details"
                                                :key="detail.id"
                                            >
                                                {{ detail.name }}:
                                                {{ numberText(detail.pendingQuantity) }} por
                                                registrar; {{ numberText(detail.suppliedQuantity) }}
                                                ya registradas y
                                                {{ numberText(detail.returnedQuantity) }} devueltas.
                                            </li>
                                        </ul>
                                    </td>
                                </tr>
                            </tbody>
                        </VTable>
                    </TableFrame>
                </template>
                <div class="historical-pagination">
                    <VBtn
                        :disabled="isWorking || preview.page <= 1"
                        @click="emit('load', preview.page - 1, true)"
                    >
                        Página anterior
                    </VBtn>
                    <VBtn
                        :disabled="isWorking || !preview.hasMore || preview.page >= limits.maxPage"
                        @click="emit('load', preview.page + 1, true)"
                    >
                        Página siguiente
                    </VBtn>
                </div>
                <VTextarea
                    :model-value="values.reason"
                    label="Motivo y evidencia de la entrega histórica"
                    :maxlength="limits.maxReasonLength"
                    :disabled="isWorking"
                    @update:model-value="emit('update', 'reason', $event ?? '')"
                />
                <VTextField
                    :model-value="values.deliveredAt"
                    type="datetime-local"
                    label="Fecha real de entrega (opcional)"
                    hint="Hora de Ciudad de México. Déjala vacía si no se conoce; el servidor registra la regularización."
                    persistent-hint
                    :disabled="isWorking"
                    @update:model-value="emit('update', 'deliveredAt', $event ?? '')"
                />
                <VCheckbox
                    :model-value="values.declaredDelivered"
                    label="Confirmo que todas las partidas pendientes seleccionadas ya se entregaron físicamente antes del corte."
                    :disabled="isWorking"
                    @update:model-value="emit('declare', $event === true)"
                />
            </template>
        </template>
    </EditorDialog>
</template>

<style scoped>
.historical-pagination {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem;
}
.historical-details {
    min-width: 16rem;
    padding-inline-start: 1rem;
}
.historical-pagination {
    margin-block: 1rem;
}
</style>
