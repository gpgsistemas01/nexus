import { toNumber } from '../../../utils/formattersUtils.js';
import { roundTo } from '../../../shared/utils/numberUtils.js';
import { getMaterialLengthField, isRollPresentation } from '../../../shared/inventory/wasteMeasurements.js';

const sum = (rows, field) => rows.reduce((total, row) => total + toNumber(row[field]), 0);

const normalizeReportIdentity = value => String(value || '').trim().toLocaleLowerCase('es-MX');

/**
 * Consolidates waste inventory by name, supplier and dimensions. A roll's
 * length varies per remnant and therefore does not split its group; other
 * presentations retain their length as part of the inventory identity.
 */
export const createWasteReportSummary = () => {
    const groups = new Map();
    const add = row => {
        const hasWidth = row.base !== null && row.base !== undefined && row.base !== '';
        const hasLength = row.height !== null && row.height !== undefined && row.height !== '';
        const isRoll = isRollPresentation(row.presentation);
        const widthField = isRoll && getMaterialLengthField(row.sourceMaterial ?? {}) === 'base' ? 'height' : 'base';
        const hasTransverseDimension = widthField === 'height' ? hasLength : hasWidth;
        const width = hasTransverseDimension ? toNumber(row[widthField]) : null;
        const length = !isRoll && hasLength ? toNumber(row.height) : null;
        const key = JSON.stringify([
            normalizeReportIdentity(row.name) || 'no-material',
            row.supplierId || normalizeReportIdentity(row.supplier) || 'no-supplier',
            width,
            length
        ]);
        const group = groups.get(key) || {
            supplier: row.supplier || 'Sin proveedor',
            name: row.name || 'Sin material',
            width,
            length,
            wasteQuantity: 0,
            squareMeters: 0,
            totalWeightKg: isRoll ? 0 : null,
            weightStatus: isRoll ? 'complete' : 'notApplicable'
        };

        const stock = toNumber(row.currentStock) || 0;
        const squareMeters = hasWidth && hasLength
            ? stock * toNumber(row.base) * toNumber(row.height)
            : 0;

        group.wasteQuantity += stock;
        group.squareMeters += squareMeters;
        if (isRoll && stock !== 0) {
            if (row.weightKg == null) {
                group.weightStatus = 'unknown';
                group.totalWeightKg = null;
            } else if (group.weightStatus === 'complete') {
                group.totalWeightKg += stock * toNumber(row.weightKg);
            }
        }
        groups.set(key, group);
    };
    const finish = () => {
        const summaryRows = [];
        let wasteQuantity = 0;
        let squareMeters = 0;
        let totalWeightKg = 0;
        let weightStatus = 'notApplicable';
        for (const group of groups.values()) {
            const row = {
                ...group,
                wasteQuantity: roundTo(group.wasteQuantity),
                squareMeters: roundTo(group.squareMeters),
                totalWeightKg: group.totalWeightKg === null ? null : roundTo(group.totalWeightKg)
            };
            summaryRows.push(row);
            wasteQuantity += row.wasteQuantity;
            squareMeters += row.squareMeters;
            totalWeightKg += row.totalWeightKg ?? 0;
            if (row.weightStatus === 'unknown') weightStatus = 'unknown';
            else if (row.weightStatus === 'complete' && weightStatus !== 'unknown') weightStatus = 'complete';
        }

        return {
            rows: summaryRows,
            totals: {
                wasteQuantity: roundTo(wasteQuantity),
                squareMeters: roundTo(squareMeters),
                totalWeightKg: weightStatus === 'complete' ? roundTo(totalWeightKg) : null,
                weightStatus
            }
        };
    };
    return { add, finish };
};

export const buildWasteReportSummary = (rows = []) => {
    const summary = createWasteReportSummary();
    rows.forEach(summary.add);
    return summary.finish();
};
