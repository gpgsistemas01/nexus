<script setup lang="ts">
import { VRow, VCol } from 'vuetify/components/VGrid';
import { VTextField } from 'vuetify/components/VTextField';
import { VTextarea } from 'vuetify/components/VTextarea';
import { VRadioGroup } from 'vuetify/components/VRadioGroup';
import { VRadio } from 'vuetify/components/VRadio';
import { VBtn } from 'vuetify/components/VBtn';
import { VAlert } from 'vuetify/components/VAlert';
import RecordEditorDialog from '../../../shared/components/RecordEditorDialog.vue';
import RemoteSelect from '../../../shared/components/RemoteSelect.vue';
import PurchaseTotals from './PurchaseTotals.vue';
import type { LookupItem, LookupState } from '../../../shared/lookup.js';
import type { PurchaseValues, PurchaseField, PurchaseDetail } from '../purchase.js';
import PurchaseDetailsTable from './PurchaseDetailsTable.vue';

defineProps<{
    title: string;
    values: PurchaseValues;
    errors: Partial<Record<PurchaseField, string>>;
    message: string;
    isSubmitting: boolean;
    isConflicted: boolean;
    isReadOnly: boolean;
    isChanging: boolean;
    isEditing: boolean;
    canChangeDetails: boolean;
    canCreateSupplier: boolean;
    canSuppliers: boolean;
    canPersons: boolean;
    suppliers: LookupState;
    persons: LookupState;
    supplier?: LookupItem;
    receiver?: LookupItem;
    details: PurchaseDetail[];
    totals: { quantity: number; net: number; gross: number };
}>();
const emit = defineEmits<{
    update: [field: PurchaseField, value: string | boolean];
    blur: [field: PurchaseField];
    search: [kind: 'suppliers' | 'persons', value: string];
    more: [kind: 'suppliers' | 'persons'];
    retry: [kind: 'suppliers' | 'persons'];
    createSupplier: [search: string];
    remove: [id: string];
    correct: [detail: PurchaseDetail];
    cancel: [detail: PurchaseDetail];
    submit: [];
    close: [];
    reload: [];
}>();
</script>

<template>
    <RecordEditorDialog
        :title="title"
        eyebrow="COMPRAS"
        :message="message"
        :is-submitting="isSubmitting || isChanging"
        :retain-focus="!isChanging"
        :is-conflicted="isConflicted"
        :show-submit="!isReadOnly"
        :max-width="1380"
        :submit-label="isEditing ? 'Actualizar' : 'Guardar'"
        close-label="Regresar"
        @submit="emit('submit')"
        @close="emit('close')"
        @reload="emit('reload')"
    >
        <section aria-label="Encabezado de compra">
            <h3 class="purchase-section-title">Datos de la compra</h3>
            <VRow>
                <VCol
                    cols="12"
                    md="6"
                >
                    <VTextField
                        v-if="isEditing || isReadOnly"
                        label="Proveedor"
                        :model-value="supplier?.title ?? ''"
                        readonly
                    />
                    <template v-else>
                        <RemoteSelect
                            label="Proveedor"
                            :model-value="values.supplierId"
                            :items="suppliers.items"
                            :is-loading="suppliers.isLoading"
                            :has-more="suppliers.hasMore"
                            :load-error="suppliers.error"
                            :error="errors.supplierId"
                            :initial-option="supplier"
                            :is-disabled="isSubmitting || !canSuppliers"
                            :hint="!canSuppliers ? 'Sin permiso para consultar proveedores.' : ''"
                            :create-label="canCreateSupplier ? 'Registrar proveedor' : undefined"
                            @create="emit('createSupplier', $event)"
                            @update:model-value="emit('update', 'supplierId', $event)"
                            @blur="emit('blur', 'supplierId')"
                            @search="emit('search', 'suppliers', $event)"
                            @more="emit('more', 'suppliers')"
                            @retry="emit('retry', 'suppliers')"
                        />
                        <VBtn
                            v-if="canCreateSupplier"
                            variant="text"
                            size="small"
                            :disabled="isSubmitting"
                            @click="emit('createSupplier', '')"
                        >
                            Registrar proveedor
                        </VBtn>
                    </template>
                </VCol>
                <VCol
                    cols="12"
                    md="6"
                >
                    <RemoteSelect
                        label="Persona que recibe"
                        :model-value="values.receivedById"
                        :items="persons.items"
                        :is-loading="persons.isLoading"
                        :has-more="persons.hasMore"
                        :load-error="persons.error"
                        :error="errors.receivedById"
                        :initial-option="receiver"
                        :is-disabled="isSubmitting || isReadOnly || !canPersons"
                        :hint="
                            !canPersons && !isReadOnly ? 'Sin permiso para consultar personas.' : ''
                        "
                        @update:model-value="emit('update', 'receivedById', $event)"
                        @blur="emit('blur', 'receivedById')"
                        @search="emit('search', 'persons', $event)"
                        @more="emit('more', 'persons')"
                        @retry="emit('retry', 'persons')"
                    />
                </VCol>
                <VCol
                    cols="12"
                    md="6"
                >
                    <VTextField
                        label="Fecha y hora de recepción:"
                        type="datetime-local"
                        hint="Hora de Ciudad de México."
                        persistent-hint
                        :model-value="values.receptionDate"
                        :readonly="isReadOnly"
                        :disabled="isSubmitting"
                        :error-messages="errors.receptionDate"
                        @update:model-value="emit('update', 'receptionDate', $event ?? '')"
                        @blur="emit('blur', 'receptionDate')"
                    />
                </VCol>
                <VCol
                    cols="12"
                    md="6"
                >
                    <VRadioGroup
                        :model-value="values.isInvoiced"
                        inline
                        label="Documento de compra"
                        :disabled="isSubmitting || isReadOnly"
                        @update:model-value="emit('update', 'isInvoiced', $event === true)"
                    >
                        <VRadio
                            label="Factura"
                            :value="true"
                        />
                        <VRadio
                            label="Remisión"
                            :value="false"
                        />
                    </VRadioGroup>
                    <VTextField
                        v-if="values.isInvoiced"
                        label="Número de Factura"
                        :model-value="values.invoice"
                        :readonly="isReadOnly"
                        :disabled="isSubmitting"
                        :error-messages="errors.invoice"
                        @update:model-value="emit('update', 'invoice', $event ?? '')"
                        @blur="emit('blur', 'invoice')"
                    />
                </VCol>
                <VCol cols="12">
                    <VTextarea
                        label="Observaciones"
                        :model-value="values.observations"
                        :readonly="isReadOnly"
                        :disabled="isSubmitting"
                        :error-messages="errors.observations"
                        rows="2"
                        auto-grow
                        @update:model-value="emit('update', 'observations', $event ?? '')"
                        @blur="emit('blur', 'observations')"
                    />
                </VCol>
            </VRow>
        </section>
        <slot name="entry" />
        <section aria-label="Partidas de compra">
            <h3 class="purchase-section-title">Partidas de la compra</h3>
            <p
                v-if="isEditing"
                class="mb-3"
            >
                Las partidas guardadas se conservan. Para corregirlas o cancelarlas, abre la compra
                en consulta.
            </p>
            <PurchaseDetailsTable
                :rows="details"
                :can-change="canChangeDetails"
                :can-remove="!isReadOnly"
                :is-disabled="isSubmitting"
                @remove="emit('remove', $event)"
                @correct="emit('correct', $event)"
                @cancel="emit('cancel', $event)"
            />
            <VAlert
                v-if="errors.details"
                type="error"
                role="alert"
                variant="tonal"
                class="mt-3"
            >
                {{ errors.details }}
            </VAlert>
        </section>
        <PurchaseTotals :totals="totals" />
        <VBtn
            v-if="isEditing || isReadOnly"
            variant="text"
            :disabled="isSubmitting"
            @click="emit('reload')"
        >
            Volver a cargar compra
        </VBtn>
    </RecordEditorDialog>
</template>

<style scoped>
.purchase-section-title {
    color: rgb(var(--v-theme-primary));
    font-size: 1rem;
    margin-bottom: 1rem;
}
</style>
