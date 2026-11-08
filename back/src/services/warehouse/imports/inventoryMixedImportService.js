import { authorizeInventoryImport, getImportConfig } from './inventoryImportConfig.js';
import { materialImportIdentity, wasteImportIdentity } from './inventoryImportContext.js';

const operations = new Map([
    ['alta', 'create'], ['create', 'create'], ['editar', 'update'], ['update', 'update'],
    ['ajustar', 'adjust'], ['adjust', 'adjust'], ['editar y ajustar', 'update-adjust'], ['update-adjust', 'update-adjust'],
    ['conservar', 'skip'], ['skip', 'skip']
]);
const summary = rows => ({ total: rows.length, creates: rows.filter(row => row.action === 'create').length,
    updates: rows.filter(row => row.action === 'update').length, unchanged: rows.filter(row => row.action === 'unchanged').length,
    errors: rows.filter(row => row.action === 'error').length });
const addError = (row, message) => {
    row.action = 'error'; row.errors.push({ field: 'operation', column: 'operacion', code: 'INVENTORY_IMPORT_VALIDATION', message });
};

export const validateMixedInventoryImport = async ({ db, config, rows, user, validate }) => {
    const groups = [];
    const results = new Map();
    const normalized = rows.map(input => ({ ...input,
        values: { ...input.values, ...(config.resource === 'wastes' && { initialQuantity: input.values.newStock ?? input.values.initialQuantity }) },
        operation: operations.get(String(input.values.operation ?? '').trim().toLowerCase()) }));
    for (const input of normalized) {
        if (!input.operation || input.operation === 'skip') {
            const row = { row: input.row, id: input.values.id || null, name: String(input.values.name ?? ''),
                before: null, after: null, details: { operation: input.operation ?? '' }, reference: null,
                dto: { operation: input.operation ?? '', id: input.values.id || null, name: String(input.values.name ?? '') },
                action: 'unchanged', errors: [], warnings: [] };
            if (!input.operation) addError(row, 'Elige Alta, Editar, Ajustar, Editar y ajustar o Conservar en cada fila.');
            results.set(input.row, row);
        }
    }
    for (const mode of ['create', 'update', 'adjust']) {
        const inputs = normalized.filter(row => row.operation === mode || (row.operation === 'update-adjust' && mode !== 'create'));
        if (!inputs.length) continue;
        const childConfig = getImportConfig(config.resource, mode);
        let permissionError;
        try { authorizeInventoryImport(user, config.resource, mode); }
        catch (error) { if (error.statusCode !== 403) throw error; permissionError = error; }
        if (permissionError) {
            for (const input of inputs) {
                const row = { row: input.row, id: input.values.id || null, name: String(input.values.name ?? ''), before: null, after: null,
                    details: { operation: input.operation }, reference: null, dto: { operation: input.operation }, action: 'error', errors: [], warnings: [] };
                addError(row, `No tienes permiso para ${mode === 'adjust' ? 'ajustar stock' : 'dar de alta o editar datos'} de este inventario.`);
                results.set(input.row, row);
            }
            continue;
        }
        // Un solo libro contiene columnas de otros modos. Sólo se traduce la captura admitida por cada contrato.
        const fields = [...childConfig.columns.map(([, field]) => field),
            ...(mode === 'create' ? ['supplierId', 'presentationId', 'unitMeasureId'] : [])];
        const capture = inputs.map(input => ({ ...input,
            values: Object.fromEntries(fields.map(field => [field, input.values[field]])) }));
        const validated = await validate({ db, config: childConfig, rows: capture, user });
        groups.push({ config: childConfig, ...validated });
        for (const row of validated.rows) {
            const input = inputs.find(input => input.row === row.row);
            const operation = input.operation;
            row.dto ??= {};
            row.dto.operation = operation;
            row.details.operation = operation;
            if (mode === 'create') row.id = null;
            if (mode === 'create' && input.values.id) addError(row, 'Un alta no lleva ID. Para un registro existente elige Editar o Ajustar.');
            if (mode === 'create' && input.values.supplierCode && input.values.supplierId
                && validated.context.supplierCodes.get(String(input.values.supplierCode).trim().toLowerCase())?.id !== input.values.supplierId) {
                addError(row, 'El código y el identificador del proveedor no coinciden. Conserva una sola referencia válida.');
            }
            if (operation === 'update' && input.values.newStock !== '' && input.values.newStock != null) addError(row, 'Para modificar datos y stock en esta fila elige Editar y ajustar.');
            const previous = results.get(row.row);
            if (operation === 'update-adjust' && previous) {
                results.set(row.row, { ...previous, before: { ...previous.before, ...row.before }, after: { ...previous.after, ...row.after },
                    dto: { ...previous.dto, ...row.dto }, reference: { data: previous.reference, stock: row.reference },
                    details: { ...previous.details, ...row.details }, warnings: [...previous.warnings, ...row.warnings],
                    errors: [...previous.errors, ...row.errors],
                    action: previous.errors.length || row.errors.length ? 'error' : previous.action === 'unchanged' && row.action === 'unchanged' ? 'unchanged' : 'update' });
            } else results.set(row.row, row);
        }
    }
    const ordered = rows.map(row => results.get(row.row));
    const targets = new Map(), identities = new Map(), shared = new Map();
    for (const row of ordered) {
        if (row.action === 'error' || row.dto.operation === 'skip') continue;
        const id = row.dto.operation === 'create' ? null : row.id;
        if (id) {
            const target = config.type ? `${id}:${row.dto.supplierId}` : id;
            if (targets.has(target)) addError(row, `El registro aparece en otra operación en la fila ${targets.get(target)}. Usa una sola fila con Editar y ajustar.`);
            targets.set(target, row.row);
        }
    }
    // Los conflictos de identidad y campos compartidos también se revisan entre operaciones distintas.
    for (const group of groups.filter(group => group.config.mode !== 'adjust')) for (const row of group.rows) {
        const result = results.get(row.row);
        if (result.action === 'error') continue;
        const source = group.config.mode === 'create' ? { ...row.dto, ...row.reference, type: config.type }
            : config.type ? group.context.offers.get(`${row.id}:${row.dto.supplierId}`).material : group.context.wastes.get(row.id);
        const identity = config.type ? materialImportIdentity({ ...source, name: row.dto.name }) : wasteImportIdentity({ ...source, name: row.dto.name });
        const materialId = row.id || row.reference?.materialId || identity;
        const previous = identities.get(identity);
        if (previous && previous.id !== materialId) addError(result, `La identidad coincide con la fila ${previous.row}.`);
        identities.set(identity, { id: materialId, row: row.row });
        if (config.type) {
            const signature = JSON.stringify([row.dto.name, row.dto.minStock]);
            if (shared.has(materialId) && shared.get(materialId) !== signature) addError(result, 'Las filas de un material deben conservar nombre y mínimo comunes, también entre operaciones.');
            shared.set(materialId, signature);
        }
    }
    return { context: { groups }, rows: ordered, summary: summary(ordered) };
};
