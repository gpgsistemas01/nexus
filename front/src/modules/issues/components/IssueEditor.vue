<script setup lang="ts">
import { VRow, VCol } from 'vuetify/components/VGrid';
import { VTextField } from 'vuetify/components/VTextField';
import { VTextarea } from 'vuetify/components/VTextarea';
import { VAlert } from 'vuetify/components/VAlert';
import RecordEditorDialog from '../../../shared/components/RecordEditorDialog.vue';
import RemoteSelect from '../../../shared/components/RemoteSelect.vue';
import IssueDetailsTable from './IssueDetailsTable.vue';
import type {
    IssueValues,
    IssueField,
    IssueMode,
    IssueDetail,
    IssueHeaderSelect,
} from '../issue.js';

defineProps<{
    title: string;
    values: IssueValues;
    errors: Partial<Record<IssueField, string>>;
    message: string;
    isSubmitting: boolean;
    isConflicted: boolean;
    canEditHeader: boolean;
    canEditDetails: boolean;
    mode: IssueMode;
    itemLabel: string;
    selects: IssueHeaderSelect[];
}>();
const emit = defineEmits<{
    update: [field: IssueField, value: string | IssueDetail[]];
    blur: [field: IssueField];
    search: [kind: IssueHeaderSelect['kind'], value: string];
    more: [kind: IssueHeaderSelect['kind']];
    retry: [kind: IssueHeaderSelect['kind']];
    remove: [id: string];
    supply: [
        id: string,
        changes: Partial<Pick<IssueDetail, 'isSupplied' | 'projectConvertedQuantity'>>,
    ];
    return: [detail: IssueDetail];
    submit: [];
    close: [];
    reload: [];
}>();
</script>

<template>
    <RecordEditorDialog
        :title="title"
        eyebrow="SALIDAS"
        :message="message"
        :is-submitting="isSubmitting"
        :is-conflicted="isConflicted"
        :show-submit="mode !== 'view' && mode !== 'return'"
        :submit-label="mode === 'create' ? 'Guardar' : mode === 'supply' ? 'Surtir' : 'Actualizar'"
        :max-width="1280"
        close-label="Regresar"
        @submit="emit('submit')"
        @close="emit('close')"
        @reload="emit('reload')"
    >
        <h3>Datos de la salida</h3>
        <VRow>
            <VCol
                v-for="select in selects"
                :key="select.field"
                cols="12"
                md="6"
            >
                <RemoteSelect
                    :label="select.label"
                    :model-value="values[select.field]"
                    :items="select.state.items"
                    :is-loading="select.state.isLoading"
                    :has-more="select.state.hasMore"
                    :load-error="select.state.error"
                    :error="errors[select.field]"
                    :initial-option="select.initialOption"
                    :is-disabled="!canEditHeader || isSubmitting || select.isDisabled"
                    :hint="select.hint"
                    @update:model-value="emit('update', select.field, $event)"
                    @blur="emit('blur', select.field)"
                    @search="emit('search', select.kind, $event)"
                    @more="emit('more', select.kind)"
                    @retry="emit('retry', select.kind)"
                />
                <slot
                    v-if="select.field === 'clientId'"
                    name="client-action"
                />
            </VCol>
            <VCol
                cols="12"
                md="6"
            >
                <VTextField
                    label="Número de proyecto"
                    :model-value="values.projectNumber"
                    :error-messages="errors.projectNumber"
                    :disabled="!canEditHeader || isSubmitting"
                    @update:model-value="emit('update', 'projectNumber', $event ?? '')"
                    @blur="emit('blur', 'projectNumber')"
                />
            </VCol>
            <VCol
                cols="12"
                md="6"
            >
                <VTextField
                    label="Fecha y hora de solicitud:"
                    type="datetime-local"
                    hint="Hora de Ciudad de México."
                    persistent-hint
                    :model-value="values.requestDate"
                    :error-messages="errors.requestDate"
                    :disabled="!canEditHeader || isSubmitting"
                    @update:model-value="emit('update', 'requestDate', $event ?? '')"
                    @blur="emit('blur', 'requestDate')"
                />
            </VCol>
            <VCol cols="12">
                <VTextarea
                    label="Observaciones"
                    rows="2"
                    :model-value="values.observations"
                    :error-messages="errors.observations"
                    :disabled="!canEditHeader || isSubmitting"
                    @update:model-value="emit('update', 'observations', $event ?? '')"
                    @blur="emit('blur', 'observations')"
                />
            </VCol>
        </VRow>
        <slot
            v-if="canEditDetails"
            name="entry"
        />
        <h3>Detalles de la salida</h3>
        <VAlert
            v-if="errors.details"
            type="error"
            variant="tonal"
            role="alert"
        >
            {{ errors.details }}
        </VAlert>
        <IssueDetailsTable
            :rows="values.details"
            :mode="mode"
            :item-label="itemLabel"
            :is-disabled="isSubmitting"
            @remove="emit('remove', $event)"
            @supply="(id, changes) => emit('supply', id, changes)"
            @return="emit('return', $event)"
        />
    </RecordEditorDialog>
</template>
