import { toNumber } from '../../../utils/formattersUtils.js';
import { roundTo } from '../../../shared/utils/numberUtils.js';
import { VAT_RATE } from '../../../shared/inventory/goodsReceiptCalculations.js';

const sum = (rows, field) => rows.reduce((total, row) => total + toNumber(row[field]), 0);

const divideOrZero = (dividend, divisor) => divisor ? dividend / divisor : 0;

/**
 * Builds the supplier and material breakdowns for the purchase report rows.
 * Monetary totals use the amounts recorded on each receipt detail so the summary
 * always reconciles with the detailed table, regardless of the report scope.
 */
export const createMonthlyGoodsReceiptSummary = () => {
    let monthlyNetPurchaseAmount = 0;
    const suppliers = new Map();
    const materials = new Map();

    const add = row => {
        const supplierName = row.supplierName || 'Sin proveedor';
        const supplier = suppliers.get(supplierName) || {
            supplierName,
            netPurchaseAmount: 0,
            monthlyPercentage: 0
        };

        const netPurchaseAmount = toNumber(row.netPurchaseAmount);
        monthlyNetPurchaseAmount += netPurchaseAmount;

        supplier.netPurchaseAmount += netPurchaseAmount;
        suppliers.set(supplierName, supplier);

        const materialKey = row.materialId || row.materialName || 'Sin material';
        const material = materials.get(materialKey) || {
            materialName: row.materialName || 'Sin material',
            squareMeters: 0,
            costPerSquareMeter: 0,
            netPurchaseAmount: 0,
            quantity: 0
        };

        const convertedQuantity = toNumber(row.convertedQuantity);

        material.squareMeters += convertedQuantity;
        material.netPurchaseAmount += netPurchaseAmount;
        material.quantity += toNumber(row.quantity);
        materials.set(materialKey, material);
    };
    const finish = () => {
        const supplierRows = [...suppliers.values()].map((supplier) => {
            const vatAmount = roundTo(supplier.netPurchaseAmount * VAT_RATE);

            return {
                ...supplier,
                vatAmount,
                grossPurchaseAmount: roundTo(supplier.netPurchaseAmount + vatAmount),
                monthlyPercentage: divideOrZero(supplier.netPurchaseAmount * 100, monthlyNetPurchaseAmount)
            };
        });
        const materialRows = [...materials.values()].map((material) => ({
            ...material,
            costPerSquareMeter: roundTo(divideOrZero(material.netPurchaseAmount, material.squareMeters))
        }));

        return {
            supplierRows,
            materialRows,
            supplierTotals: {
                netPurchaseAmount: monthlyNetPurchaseAmount,
                vatAmount: sum(supplierRows, 'vatAmount'),
                grossPurchaseAmount: sum(supplierRows, 'grossPurchaseAmount'),
                monthlyPercentage: monthlyNetPurchaseAmount ? 100 : 0
            },
            materialTotals: {
                squareMeters: sum(materialRows, 'squareMeters'),
                costPerSquareMeter: roundTo(sum(materialRows, 'costPerSquareMeter')),
                netPurchaseAmount: monthlyNetPurchaseAmount,
                quantity: sum(materialRows, 'quantity')
            }
        };
    };
    return { add, finish };
};

export const buildMonthlyGoodsReceiptSummary = (rows = []) => {
    const summary = createMonthlyGoodsReceiptSummary();
    rows.forEach(summary.add);
    return summary.finish();
};
