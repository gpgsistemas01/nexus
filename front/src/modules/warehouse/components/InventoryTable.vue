<script setup lang="ts">
import { ref } from 'vue';
import { VTable } from 'vuetify/components/VTable';
import { VBtn } from 'vuetify/components/VBtn';
import { VChip } from 'vuetify/components/VChip';
import type { EditorTarget, InventoryPermissions, InventoryRow } from '../inventory.js';

defineProps<{
    rows: InventoryRow[];
    permissions: InventoryPermissions;
    isWaste: boolean;
    isLoading: boolean;
}>();
const emit = defineEmits<{ action: [target: EditorTarget] }>();
const expanded = ref<string | null>(null);
const numeric = (value: string | number | null | undefined) =>
    value == null ? '—' : Number(value).toLocaleString('es-MX', { maximumFractionDigits: 6 });
</script>

<template>
    <div
        class="inventory-table"
        :aria-busy="isLoading"
    >
        <VTable>
            <thead>
                <tr>
                    <th>Material y proveedor</th>
                    <th>Presentación</th>
                    <th>Stock actual</th>
                    <th>Stock mínimo</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                <template
                    v-for="row in rows"
                    :key="row.id"
                >
                    <tr :class="{ 'low-stock': Number(row.currentStock) < Number(row.minStock) }">
                        <td>
                            <strong>{{ row.name }}</strong
                            ><span class="supplier-name">{{ row.supplierName }}</span>
                        </td>
                        <td>
                            {{ row.presentation
                            }}<span class="supplier-name">{{ row.unitMeasure }}</span>
                        </td>
                        <td>
                            <strong>{{ numeric(row.currentStock) }}</strong
                            ><VChip
                                v-if="Number(row.currentStock) < Number(row.minStock)"
                                size="x-small"
                                color="warning"
                                >Stock bajo</VChip
                            >
                        </td>
                        <td>{{ numeric(row.minStock) }}</td>
                        <td class="row-actions">
                            <VBtn
                                size="small"
                                variant="text"
                                :aria-expanded="expanded === row.id"
                                @click="expanded = expanded === row.id ? null : row.id"
                                >Detalles</VBtn
                            >
                            <VBtn
                                v-if="permissions.canWrite"
                                size="small"
                                variant="text"
                                @click="emit('action', { action: 'edit', row })"
                                >Editar</VBtn
                            >
                            <VBtn
                                v-if="permissions.canAdjust"
                                size="small"
                                variant="text"
                                @click="emit('action', { action: 'stock', row })"
                                >Ajustar stock</VBtn
                            >
                            <VBtn
                                v-if="permissions.canAdd"
                                size="small"
                                variant="text"
                                @click="emit('action', { action: 'add-stock', row })"
                                >Agregar stock</VBtn
                            >
                            <VBtn
                                v-if="!isWaste && permissions.canWrite && row.canDelete"
                                color="error"
                                size="small"
                                variant="text"
                                @click="emit('action', { action: 'delete', row })"
                                >Eliminar</VBtn
                            >
                        </td>
                    </tr>
                    <tr v-if="expanded === row.id">
                        <td colspan="5">
                            <dl class="inventory-details">
                                <div>
                                    <dt>Base / Altura (m)</dt>
                                    <dd>{{ numeric(row.base) }} / {{ numeric(row.height) }}</dd>
                                </div>
                                <div>
                                    <dt>Cantidad convertida</dt>
                                    <dd>
                                        {{ numeric(row.convertedQuantity) }} {{ row.unitMeasure }}
                                    </dd>
                                </div>
                                <div v-if="permissions.canReadCosts">
                                    <dt>Costo máximo unitario</dt>
                                    <dd>
                                        {{
                                            row.maxUnitCost == null
                                                ? '—'
                                                : Number(row.maxUnitCost).toLocaleString('es-MX', {
                                                      style: 'currency',
                                                      currency: 'MXN',
                                                  })
                                        }}
                                    </dd>
                                </div>
                                <div v-if="permissions.canReadState">
                                    <dt>Activo</dt>
                                    <dd>{{ row.isActive ? 'Sí' : 'No' }}</dd>
                                </div>
                                <template v-if="isWaste && row.weightKg != null">
                                    <div>
                                        <dt>Cono / Total / Neto (kg)</dt>
                                        <dd>
                                            {{ numeric(row.coneWeightKg) }} /
                                            {{ numeric(row.totalWeightKg) }} /
                                            {{ numeric(row.weightKg) }}
                                        </dd>
                                    </div>
                                    <div v-if="row.referenceRollTotalWeightKg != null">
                                        <dt>Rollo completo con cono (kg)</dt>
                                        <dd>{{ numeric(row.referenceRollTotalWeightKg) }}</dd>
                                    </div>
                                    <div v-if="row.sampleLengthM != null">
                                        <dt>Referencia histórica: largo / peso neto</dt>
                                        <dd>
                                            {{ numeric(row.sampleLengthM) }} m /
                                            {{ numeric(row.sampleNetWeightKg) }} kg
                                        </dd>
                                    </div>
                                </template>
                            </dl>
                        </td>
                    </tr>
                </template>
                <tr v-if="!rows.length && !isLoading">
                    <td
                        colspan="5"
                        class="empty-state"
                    >
                        No hay registros para estos filtros.
                    </td>
                </tr>
            </tbody>
        </VTable>
    </div>
</template>

<style scoped>
.inventory-table {
    border: 1px solid #d7e6dc;
    border-radius: 1rem;
    overflow: hidden;
    background: white;
}
.supplier-name {
    display: block;
    color: #64796c;
    font-size: 0.85rem;
    margin-top: 0.2rem;
}
.row-actions {
    min-width: 230px;
}
.row-actions :deep(.v-btn) {
    margin: 0.15rem;
    text-transform: none;
    letter-spacing: normal;
}
.low-stock {
    background: #fff8e5;
}
.empty-state {
    padding: 2.5rem !important;
    text-align: center;
    color: #64796c;
}
.inventory-details {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem 2rem;
    padding: 1rem 0;
}
dt {
    font-size: 0.8rem;
    color: #64796c;
}
dd {
    margin: 0.3rem 0 0;
    font-weight: 600;
}
</style>
