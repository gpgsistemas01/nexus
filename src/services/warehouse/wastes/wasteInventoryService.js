import { WasteIssueStockConflict } from '../../../errors/warehouse/wasteIssueError.js';
import { updateWasteStocks } from '../../../repository/warehouse/stockUpdateRepository.js';
import { normalizeDecimal } from '../../../utils/formattersUtils.js';

export const applyWasteStockChanges = async ({ tx, changes }) => {
    const rows = await updateWasteStocks({ tx, changes });
    const balances = new Map(rows.map(row => [row.id, row]));

    for (const change of changes) {
        const updated = balances.get(change.id);
        if (!updated) throw new WasteIssueStockConflict({ materialName: change.materialName });

        const newStock = normalizeDecimal(updated.currentStock);
        balances.set(change.id, { previousStock: normalizeDecimal(newStock - change.quantityChange), newStock });
    }

    return balances;
};
