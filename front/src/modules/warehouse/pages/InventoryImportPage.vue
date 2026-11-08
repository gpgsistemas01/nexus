<script setup lang="ts">
import { computed, ref } from 'vue';
import InventoryImportDialog from '../components/InventoryImportDialog.vue';
import { useInventoryImport } from '../composables/useInventoryImport.js';
import { useRemoteOptions } from '../composables/useRemoteOptions.js';
import type { InventoryResource } from '../inventory.js';

const props = defineProps<{
    resource: InventoryResource;
    userId: string;
    canReadSuppliers: boolean;
    initialSupplierId: string;
    initialSearch: string;
}>();
const emit = defineEmits<{ close: []; saved: []; unauthorized: [] }>();
const supplierId = ref(props.initialSupplierId);
const search = ref(props.initialSearch);
const templatePage = ref(1);
const suppliers = useRemoteOptions(
    'suppliers',
    computed(() => props.canReadSuppliers),
);
const state = useInventoryImport({
    resource: props.resource,
    userId: props.userId,
    onSaved: () => emit('saved'),
    onUnauthorized: () => emit('unauthorized'),
});
const { mode, batch, file, isWorking, error, recoveryRequired, canConfirm } = state;
const isDownloading = computed(
    () => state.template.isExporting.value || state.errors.isExporting.value,
);
const downloadError = computed(
    () => state.template.exportError.value || state.errors.exportError.value,
);

const download = () =>
    state.template.exportReport({
        supplierId: supplierId.value,
        search: search.value,
        page: templatePage.value,
    });
</script>

<template>
    <InventoryImportDialog
        :resource="resource"
        :mode="mode"
        :batch="batch"
        :file="file"
        :is-working="isWorking"
        :is-downloading="isDownloading"
        :can-confirm="canConfirm"
        :recovery-required="recoveryRequired"
        :error="error"
        :download-error="downloadError"
        :supplier-id="supplierId"
        :search="search"
        :template-page="templatePage"
        :suppliers="suppliers.state.value"
        :can-read-suppliers="canReadSuppliers"
        @mode="mode = $event"
        @file="state.selectFile"
        @prepare="state.prepare"
        @confirm="state.confirm"
        @recover="state.recover"
        @discard="state.discard"
        @template="download"
        @errors="state.errors.exportReport(undefined)"
        @supplier="supplierId = $event"
        @search="search = $event"
        @template-page="templatePage = $event"
        @search-suppliers="suppliers.updateSearch"
        @more-suppliers="suppliers.loadMore"
        @retry-suppliers="suppliers.retry"
        @close="emit('close')"
    />
</template>
