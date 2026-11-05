<script setup lang="ts">
import { VTextField } from 'vuetify/components/VTextField';
import { VTextarea } from 'vuetify/components/VTextarea';
import RecordEditorDialog from '../../../shared/components/RecordEditorDialog.vue';
import { numberText } from '../../../shared/utils/formatNumbers.js';

defineProps<{
    name: string;
    supplied: number;
    returned: number;
    available: number;
    values: { returnQuantity: string; observations: string };
    errors: Partial<Record<'returnQuantity' | 'observations', string>>;
    message: string;
    isSubmitting: boolean;
    isConflicted: boolean;
}>();
const emit = defineEmits<{
    update: [field: 'returnQuantity' | 'observations', value: string];
    blur: [field: 'returnQuantity' | 'observations'];
    submit: [];
    close: [];
    reload: [];
}>();
</script>

<template>
    <RecordEditorDialog
        title="Devolver detalle de salida"
        eyebrow="SALIDAS"
        :context="`Material a devolver: ${name}`"
        :message="message"
        :is-submitting="isSubmitting"
        :is-conflicted="isConflicted"
        submit-label="Devolver"
        close-label="Regresar"
        @submit="emit('submit')"
        @close="emit('close')"
        @reload="emit('reload')"
    >
        <h3>Devolución del detalle</h3>
        <VTextField
            label="Cantidad a devolver"
            type="number"
            min="0.01"
            :max="available"
            step="0.01"
            :model-value="values.returnQuantity"
            :error-messages="errors.returnQuantity"
            :disabled="isSubmitting"
            @update:model-value="emit('update', 'returnQuantity', $event ?? '')"
            @blur="emit('blur', 'returnQuantity')"
        />
        <VTextarea
            label="Observaciones"
            rows="3"
            :model-value="values.observations"
            :error-messages="errors.observations"
            :disabled="isSubmitting"
            @update:model-value="emit('update', 'observations', $event ?? '')"
            @blur="emit('blur', 'observations')"
        />
        <h3>Cantidades del detalle</h3>
        <dl
            aria-label="Cantidades del detalle"
            class="return-totals"
        >
            <div>
                <dt>Cantidad surtida</dt>
                <dd>{{ numberText(supplied) }}</dd>
            </div>
            <div>
                <dt>Cantidad devuelta</dt>
                <dd>{{ numberText(returned) }}</dd>
            </div>
            <div>
                <dt>Disponible para devolver</dt>
                <dd>{{ numberText(available) }}</dd>
            </div>
        </dl>
    </RecordEditorDialog>
</template>

<style scoped>
.return-totals {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
}
.return-totals div {
    padding: 1rem;
    background: rgba(var(--v-theme-primary), 0.06);
    border-radius: 0.75rem;
}
dt {
    font-size: 0.85rem;
}
dd {
    margin: 0.5rem 0 0;
    font-weight: 700;
}
</style>
