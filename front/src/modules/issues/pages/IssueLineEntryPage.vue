<script setup lang="ts">
import { useIssueLineEntry } from '../composables/useIssueLineEntry.js';
import { ISSUE_CONFIG } from '../issueConfig.js';
import type { IssueResource, IssueDetail } from '../issue.js';
import IssueLineEntryForm from '../components/IssueLineEntryForm.vue';

const props = defineProps<{ resource: IssueResource; isDisabled: boolean; canRead: boolean }>();
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
        :label="ISSUE_CONFIG[resource].item"
        :values="entry.values"
        :errors="entry.errors.value"
        :state="entry.items.state.value"
        :selected="entry.selected.value"
        :is-disabled="isDisabled || !canRead"
        :minimum="resource === 'wastes' ? '0.01' : '1'"
        @update="entry.update"
        @blur="entry.blur"
        @search="entry.items.updateSearch"
        @more="entry.items.loadMore"
        @retry="entry.items.retry"
        @add="entry.add"
    />
</template>
