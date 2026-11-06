import type { LookupItem } from '../lookup.js';
import { isRecord } from './isRecord.js';

export const getLookupPresentation = (option?: LookupItem): string => {
    const data = option?.data;
    const item = data && isRecord(data.material) ? data.material : data;
    const presentation = item && isRecord(item.presentation) ? item.presentation : undefined;
    return typeof presentation?.name === 'string' ? presentation.name : '';
};
