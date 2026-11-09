<script setup lang="ts">
import { VAlert } from 'vuetify/components/VAlert';
import { VBtn } from 'vuetify/components/VBtn';
import { VCheckbox } from 'vuetify/components/VCheckbox';
import { VTextField } from 'vuetify/components/VTextField';
import { VTextarea } from 'vuetify/components/VTextarea';
import { HISTORICAL_DELIVERY_LIMITS as limits } from '@nexus/historical-deliveries';
import EditorDialog from '../../../shared/components/EditorDialog.vue';
import { numberText } from '../../../shared/utils/formatNumbers.js';
import type {
    HistoricalDeliveryPreview,
    HistoricalDeliveryReceipt,
} from '../historicalDelivery.js';

defineProps<{
    values: {
        cutoffDate: string;
        deliveredAt: string;
        reason: string;
        declaredDelivered: boolean;
        search: string;
    };
    preview: HistoricalDeliveryPreview | null;
    receipt: HistoricalDeliveryReceipt | null;
    selected: string[];
    isWorking: boolean;
    recoveryRequired: boolean;
    canConfirm: boolean;
    error: string;
}>();
const emit = defineEmits<{
    update: [field: 'cutoffDate' | 'deliveredAt' | 'reason' | 'search', value: string];
    declare: [value: boolean];
    select: [id: string];
    selectAll: [];
    load: [page?: number];
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
            Usa este registro para salidas que ya se entregaron físicamente antes del corte. Primero
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
            <VTextField
                :model-value="values.cutoffDate"
                type="datetime-local"
                label="Fecha y hora de corte"
                hint="Hora de Ciudad de México."
                persistent-hint
                :disabled="isWorking"
                @update:model-value="emit('update', 'cutoffDate', $event ?? '')"
            />
            <VTextField
                :model-value="values.search"
                label="Buscar folio o proyecto"
                :maxlength="limits.maxSearchLength"
                :disabled="isWorking"
                @update:model-value="emit('update', 'search', $event ?? '')"
            />
            <VBtn
                variant="outlined"
                :disabled="isWorking || !values.cutoffDate"
                class="mb-4"
                @click="emit('load')"
            >
                Buscar salidas pendientes al corte
            </VBtn>
            <template v-if="preview">
                <p>
                    Revisa las partidas pendientes y selecciona sólo las salidas entregadas por
                    completo. Cambiar de página limpia la selección.
                </p>
                <VBtn
                    v-if="preview.documents.length"
                    variant="text"
                    :disabled="isWorking"
                    @click="emit('selectAll')"
                >
                    Seleccionar las {{ preview.documents.length }} salidas de esta página
                </VBtn>
                <p
                    v-else
                    role="status"
                >
                    No hay salidas pendientes para este corte y búsqueda.
                </p>
                <div
                    v-for="item in preview.documents"
                    :key="item.id"
                    class="historical-candidate"
                >
                    <VCheckbox
                        :model-value="selected.includes(item.id)"
                        :label="`${item.referenceNumber} · ${item.departmentName} · ${item.projectNumber}`"
                        :disabled="isWorking"
                        hide-details
                        @update:model-value="emit('select', item.id)"
                    />
                    <ul>
                        <li
                            v-for="detail in item.details"
                            :key="detail.id"
                        >
                            {{ detail.name }}: {{ numberText(detail.pendingQuantity) }} por
                            registrar; {{ numberText(detail.suppliedQuantity) }} ya registradas y
                            {{ numberText(detail.returnedQuantity) }} devueltas.
                        </li>
                    </ul>
                </div>
                <div class="d-flex ga-2 my-4">
                    <VBtn
                        :disabled="isWorking || preview.page <= 1"
                        @click="emit('load', preview.page - 1)"
                    >
                        Página anterior
                    </VBtn>
                    <VBtn
                        :disabled="isWorking || !preview.hasMore || preview.page >= limits.maxPage"
                        @click="emit('load', preview.page + 1)"
                    >
                        Página siguiente
                    </VBtn>
                </div>
                <p>{{ selected.length }} salidas seleccionadas.</p>
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
.historical-candidate {
    border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.15);
    padding-block: 0.75rem;
}
.historical-candidate ul {
    padding-inline-start: 2rem;
}
</style>
