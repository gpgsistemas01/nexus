import { computed, shallowRef, watch } from 'vue';
import { useRemoteLookup } from '../../../shared/composables/useRemoteLookup.js';
import { issueLookupService } from '../services/issueLookupService.js';
import type { LookupItem } from '../../../shared/lookup.js';
import type { IssueResource } from '../issue.js';

export const useIssueDepartments = (options: {
    resource: IssueResource;
    isEnabled: () => boolean;
    getSelectedId: () => string;
    selectDefault: (id: string) => void;
}) => {
    const singleDepartment = shallowRef<LookupItem>();
    const lookup = useRemoteLookup(async (search, page, signal) => {
        const result = await issueLookupService.list(
            'departments',
            options.resource,
            search,
            page,
            signal,
        );

        // El total sin búsqueda identifica el alcance, no una página o un resultado filtrado.
        if (!signal.aborted && !search && page === 1) {
            const item = result.data[0];
            singleDepartment.value =
                result.recordsFiltered === 1 && result.data.length === 1 && !item?.isDisabled
                    ? item
                    : undefined;
        }

        return result;
    }, computed(options.isEnabled));

    watch([lookup.items, singleDepartment, options.getSelectedId], () => {
        if (
            options.isEnabled() &&
            singleDepartment.value &&
            lookup.items.value.some((item) => item.id === singleDepartment.value?.id) &&
            !options.getSelectedId()
        )
            options.selectDefault(singleDepartment.value.id);
    });

    const isLocked = computed(
        () => !!singleDepartment.value && options.getSelectedId() === singleDepartment.value.id,
    );

    return { ...lookup, isLocked };
};
