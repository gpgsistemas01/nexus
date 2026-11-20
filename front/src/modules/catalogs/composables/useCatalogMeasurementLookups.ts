import type { Ref } from 'vue';
import { useRemoteLookup } from '../../../shared/composables/useRemoteLookup.js';
import { catalogService } from '../services/catalogService.js';

export const useCatalogMeasurementLookups = (enabled: Ref<boolean>, includeInactive = false) => {
    const lookup = (name: 'presentations' | 'unit-measures') =>
        useRemoteLookup(async (search, page, signal) => {
            const result = await catalogService.list(name, { search, page, length: 20 }, signal);
            return {
                ...result,
                data: result.data.map((entry) => ({
                    id: entry.id,
                    title:
                        name === 'unit-measures' ? `${entry.name} (${entry.symbol})` : entry.name,
                    isDisabled: !includeInactive && entry.isActive === false,
                    data: { ...entry },
                })),
            };
        }, enabled);

    return {
        presentationId: lookup('presentations'),
        unitMeasureId: lookup('unit-measures'),
    };
};
