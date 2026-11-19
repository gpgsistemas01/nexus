<script setup lang="ts">
import { DECIMAL_INPUT_FORMAT } from '@nexus/input-validation';
import { useIssueLineEntry } from '../composables/useIssueLineEntry.js';
import { ISSUE_CONFIG } from '../issueConfig.js';
import { getLookupPresentation } from '../../../shared/utils/articleOptions.js';
import type { IssueResource, IssueDetail } from '../issue.js';
import IssueLineEntryForm from '../components/IssueLineEntryForm.vue';

const props = defineProps<{
    columns: string[];
    resource: IssueResource;
    isDisabled: boolean;
    canRead: boolean;
}>();
const emit = defineEmits<{ add: [line: IssueDetail] }>();
const entry = useIssueLineEntry({
    resource: props.resource,
    isDisabled: () => props.isDisabled,
    canRead: () => props.canRead,
    onAdd: (line) => emit('add', line),
});
</script>

<template>
    <IssueLineEntryForm
        :columns="columns"
        :label="ISSUE_CONFIG[resource].item"
        :values="entry.values"
        :errors="entry.errors.value"
        :state="entry.items.state.value"
        :selected="entry.selected.value"
        :presentation="getLookupPresentation(entry.selected.value)"
        :is-disabled="isDisabled || !canRead"
        :minimum="String(DECIMAL_INPUT_FORMAT.minimumPositive)"
        @update="entry.update"
        @blur="entry.blur"
        @search="entry.items.updateSearch"
        @more="entry.items.loadMore"
        @retry="entry.items.retry"
        @add="entry.add"
    />
</template>
