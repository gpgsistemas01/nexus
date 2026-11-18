import { ApiError } from '../http/apiError.js';
import { readText } from '../http/recordContract.js';
import { isRecord } from './isRecord.js';
import type { LookupItem } from '../lookup.js';

export const mapMaterialOption = (
    value: Record<string, unknown>,
    expectedType: 'MATERIAL' | 'CONSUMABLE',
): LookupItem => {
    const material = isRecord(value.material) ? value.material : {};
    // También acepta el listado de inventario, cuyo contrato omite type.
    if (material.type !== undefined && material.type !== expectedType)
        throw new ApiError('El servidor devolvió un artículo de otro catálogo.');

    const id = readText(material, 'id');
    const name = readText(material, 'name');
    const presentation = readText(
        isRecord(material.presentation) ? material.presentation : {},
        'name',
    );
    return {
        id,
        title: [
            name,
            material.base != null && material.height != null
                ? `${material.base} × ${material.height}`
                : '',
            presentation,
        ]
            .filter(Boolean)
            .join(' · '),
        isDisabled: value.isActive === false,
        data: value,
    };
};
