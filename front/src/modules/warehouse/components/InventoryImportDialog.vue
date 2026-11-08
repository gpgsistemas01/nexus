<script setup lang="ts">
import { computed, ref } from 'vue';
import { VAlert } from 'vuetify/components/VAlert';
import { VBtn } from 'vuetify/components/VBtn';
import { VFileInput } from 'vuetify/components/VFileInput';
import { VSelect } from 'vuetify/components/VSelect';
import { VTextField } from 'vuetify/components/VTextField';
import { VPagination } from 'vuetify/components/VPagination';
import EditorDialog from '../../../shared/components/EditorDialog.vue';
import RemoteSelect from '../../../shared/components/RemoteSelect.vue';
import { IMPORT_FIELD_LABELS } from '../inventoryImport.js';
import type { ImportValue, InventoryImportBatch, InventoryImportMode } from '../inventoryImport.js';
import type { InventoryResource } from '../inventory.js';
import type { LookupState } from '../../../shared/lookup.js';

const props = defineProps<{
    resource: InventoryResource;
    mode: InventoryImportMode;
    batch: InventoryImportBatch | null;
    file: File | null;
    isWorking: boolean;
    isDownloading: boolean;
    canConfirm: boolean;
    recoveryRequired: boolean;
    error: string;
    downloadError: string;
    suppliers: LookupState;
    supplierId: string;
    search: string;
    templatePage: number;
    canReadSuppliers: boolean;
}>();
const emit = defineEmits<{
    mode: [value: InventoryImportMode];
    file: [value: File | null];
    prepare: [];
    confirm: [];
    recover: [];
    discard: [];
    close: [];
    template: [];
    errors: [];
    supplier: [value: string];
    search: [value: string];
    templatePage: [value: number];
    searchSuppliers: [value: string];
    moreSuppliers: [];
    retrySuppliers: [];
}>();
const page = ref(1);
const preview = computed(() => props.batch?.result ?? props.batch?.preview);
const rows = computed(
    () => preview.value?.rows.slice((page.value - 1) * 10, page.value * 10) ?? [],
);
const names = { materials: 'materiales', consumables: 'consumibles', wastes: 'mermas' };
const actions = {
    create: 'Nuevo',
    update: 'Actualizar',
    unchanged: 'Sin cambios',
    error: 'Corregir',
};

const text = (value: ImportValue | undefined) =>
    value === true
        ? 'Sí'
        : value === false
          ? 'No'
          : value == null || value === ''
            ? '—'
            : String(value);

const details = (value: Record<string, ImportValue>) =>
    Object.entries(value).filter(
        ([key, content]) => IMPORT_FIELD_LABELS[key] && content !== null && content !== '',
    );

const locked = computed(() => props.isWorking || props.isDownloading);
</script>

<template>
    <EditorDialog
        :title="`Importar Excel de ${names[resource]}`"
        :is-submitting="locked"
        :show-submit="!batch && !recoveryRequired"
        :is-submit-disabled="!file"
        submit-label="Validar archivo"
        note="Hasta 100 filas y 2 MiB. La confirmación aplica todo el lote."
        @close="emit('close')"
        @submit="emit('prepare')"
    >
        <VAlert
            v-if="error || downloadError"
            type="error"
            variant="tonal"
            class="mb-4"
            role="alert"
        >
            {{ error || downloadError }}
        </VAlert>
        <VAlert
            v-if="recoveryRequired"
            type="warning"
            variant="tonal"
            class="mb-4"
        >
            Hay una confirmación pendiente. Revisa su estado antes de subir otro archivo; el
            reintento usa la misma clave para evitar duplicados.
            <VBtn
                class="mt-2"
                variant="outlined"
                :disabled="locked"
                @click="emit('recover')"
            >
                Revisar y reintentar confirmación
            </VBtn>
        </VAlert>
        <template v-if="!batch && !recoveryRequired">
            <VSelect
                :model-value="mode"
                label="Operación"
                :items="[
                    { title: 'Crear registros', value: 'create' },
                    { title: 'Actualizar datos', value: 'update' },
                ]"
                :disabled="locked"
                @update:model-value="emit('mode', $event)"
            />
            <p class="mb-4">
                {{
                    mode === 'create'
                        ? 'El sistema genera los IDs de las altas. Descarga la plantilla y usa las opciones de Catálogos.'
                        : 'Descarga los registros con sus IDs y versiones. Edita nombre, mínimo, costo o activo y vuelve a subir el archivo sin cambiar las columnas grises. El stock se maneja por separado.'
                }}
            </p>
            <p class="mb-4">
                Un duplicado o error bloquea todo el archivo. La vista previa indica las filas que
                debes corregir.
            </p>
            <div class="template-fields">
                <RemoteSelect
                    v-if="canReadSuppliers"
                    label="Proveedor de la plantilla"
                    :model-value="supplierId"
                    :state="suppliers"
                    :is-disabled="locked"
                    @update:model-value="emit('supplier', $event)"
                    @search="emit('searchSuppliers', $event)"
                    @more="emit('moreSuppliers')"
                    @retry="emit('retrySuppliers')"
                />
                <VTextField
                    :model-value="search"
                    label="Buscar registros de la plantilla"
                    :disabled="locked"
                    maxlength="200"
                    @update:model-value="emit('search', $event)"
                />
                <VTextField
                    v-if="mode === 'update'"
                    :model-value="templatePage"
                    label="Página de la plantilla (100 filas)"
                    type="number"
                    min="1"
                    max="999"
                    :disabled="locked"
                    @update:model-value="emit('templatePage', Number($event))"
                />
            </div>
            <p
                v-if="resource === 'wastes' && mode === 'create'"
                class="mb-3"
            >
                Selecciona el proveedor para incluir sus materiales de referencia en m². En el
                Excel, elige la opción completa de la lista sin escribir el ID manualmente.
            </p>
            <VBtn
                variant="outlined"
                class="mb-5"
                :disabled="
                    locked ||
                    (resource === 'wastes' && mode === 'create' && !supplierId) ||
                    !Number.isInteger(templatePage) ||
                    templatePage < 1 ||
                    templatePage > 999
                "
                :loading="isDownloading"
                @click="emit('template')"
            >
                Descargar plantilla
            </VBtn>
            <VFileInput
                :model-value="file"
                label="Archivo Excel (.xlsx)"
                accept=".xlsx"
                :disabled="locked"
                show-size
                clearable
                @update:model-value="
                    emit('file', Array.isArray($event) ? ($event[0] ?? null) : $event)
                "
            />
            <p class="retention-note">
                El servidor descarta el archivo después del análisis. El borrador vence en 24 horas.
                El original de tu equipo permanece bajo tu control.
            </p>
        </template>
        <template v-if="batch">
            <p class="retention-note mb-3">Referencia: {{ batch.id }}</p>
            <VAlert
                v-if="batch.status === 'COMPLETED'"
                type="success"
                variant="tonal"
                class="mb-4"
            >
                Importación confirmada. El inventario se actualizó.
            </VAlert>
            <VAlert
                v-else-if="['CANCELED', 'EXPIRED'].includes(batch.status)"
                type="info"
                variant="tonal"
                class="mb-4"
            >
                El borrador fue descartado o venció. Descarga una plantilla nueva.
            </VAlert>
            <template v-if="preview">
                <VAlert
                    v-if="batch.status === 'DRAFT' && !recoveryRequired"
                    :type="preview.summary.errors ? 'warning' : 'info'"
                    variant="tonal"
                    class="mb-4"
                    :role="preview.summary.errors ? 'alert' : 'status'"
                >
                    {{
                        preview.summary.errors
                            ? 'No se ha guardado ninguna fila. Corrige todos los errores o duplicados y vuelve a validar el archivo.'
                            : 'Esta es una vista previa. Todavía no se ha guardado ningún cambio; revisa las filas y confirma la importación.'
                    }}
                </VAlert>
                <p class="mb-3">
                    {{ batch.status === 'COMPLETED' ? 'Resultado de' : 'Vista previa de' }}
                    <strong>{{ batch.filename }}</strong>
                    : {{ preview.summary.creates }} nuevos, {{ preview.summary.updates }} cambios,
                    {{ preview.summary.unchanged }} sin cambios y {{ preview.summary.errors }} con
                    errores.
                </p>
                <VAlert
                    v-if="mode === 'update' && resource !== 'wastes'"
                    type="info"
                    variant="tonal"
                    class="mb-4"
                >
                    Nombre y mínimo se comparten entre los proveedores del mismo artículo. Revisa
                    todas sus filas.
                </VAlert>
                <VBtn
                    v-if="preview.summary.errors && batch.status === 'DRAFT'"
                    variant="outlined"
                    :disabled="locked"
                    class="mb-4"
                    @click="emit('errors')"
                >
                    Descargar errores
                </VBtn>
                <ol class="preview-rows">
                    <li
                        v-for="row in rows"
                        :key="row.row"
                        class="preview-row"
                    >
                        <p>
                            <strong>Fila {{ row.row }}: {{ row.name }}</strong>
                            · {{ actions[row.action] }}
                        </p>
                        <dl class="preview-values">
                            <template
                                v-for="[key, value] in details(row.details)"
                                :key="key"
                            >
                                <dt>{{ IMPORT_FIELD_LABELS[key] }}</dt>
                                <dd>{{ text(value) }}</dd>
                            </template>
                            <template
                                v-for="(value, key) in row.after"
                                :key="key"
                            >
                                <dt>{{ IMPORT_FIELD_LABELS[key] ?? key }}</dt>
                                <dd>
                                    <template v-if="row.before && row.before[key] !== value">
                                        {{ text(row.before[key]) }} →
                                    </template>
                                    {{ text(value) }}
                                </dd>
                            </template>
                        </dl>
                        <p
                            v-for="issue in row.errors"
                            :key="`${issue.column}:${issue.code}`"
                            class="text-error"
                        >
                            {{ issue.column }}: {{ issue.message }}
                        </p>
                        <p
                            v-for="warning in row.warnings"
                            :key="warning"
                            class="text-warning"
                        >
                            {{ warning }}
                        </p>
                    </li>
                </ol>
                <VPagination
                    v-if="preview.rows.length > 10"
                    v-model="page"
                    :length="Math.ceil(preview.rows.length / 10)"
                    :total-visible="3"
                    aria-label="Páginas de la vista previa"
                />
            </template>
        </template>
        <template #actions>
            <VBtn
                v-if="batch || recoveryRequired"
                variant="outlined"
                :disabled="locked"
                @click="emit('discard')"
            >
                {{ batch?.status === 'COMPLETED' ? 'Otro archivo' : 'Descartar borrador' }}
            </VBtn>
            <VBtn
                v-if="canConfirm"
                color="primary"
                variant="flat"
                :disabled="locked"
                @click="emit('confirm')"
            >
                Confirmar importación
            </VBtn>
        </template>
    </EditorDialog>
</template>

<style scoped>
.template-fields {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
    gap: 1rem;
}
.preview-rows {
    list-style: none;
    padding: 0;
    display: grid;
    gap: 1rem;
}
.preview-row {
    padding: 1rem;
    border: 1px solid rgba(var(--v-theme-primary), 0.2);
    border-radius: 0.75rem;
    overflow-wrap: anywhere;
}
.preview-values {
    display: grid;
    grid-template-columns: minmax(90px, 1fr) minmax(0, 2fr);
    gap: 0.25rem 0.75rem;
    margin-block: 0.75rem;
    font-size: 0.85rem;
}
.preview-values dt {
    font-weight: 600;
}
.preview-values dd {
    margin: 0;
}
.retention-note {
    color: rgb(var(--v-theme-muted));
    font-size: 0.8rem;
}
</style>
