import { randomUUID } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { UUID_V4_PATTERN } from '../../../shared/constants/inputValidation.js';
import { MATERIAL_TYPES } from '../../../shared/constants/inventory.js';
import { INVENTORY_IMPORT_MODES as modes, INVENTORY_IMPORT_ROW_ACTIONS as actions } from '../../../shared/constants/inventoryImport.js';
import { materialCatalogValidation } from '../../../shared/validation/validators.js';
import { applyUnitPresentationMeasurements } from '../../../shared/inventory/wasteMeasurements.js';
import { errorMap } from '../../../messages/codeMessages.js';
import { MaterialIdentityLinkedConflict } from '../../../errors/warehouse/materialError.js';
import { toNumber } from '../../../utils/formattersUtils.js';
import { lockInventoryImportReferences } from '../../../repository/warehouse/inventoryImportWriteRepository.js';
import { materialCatalogIdentityChanged, updateMaterialCatalogEntry } from '../materials/materialCatalogService.js';
import { getMaterialMeasurementError } from '../materials/materialHelpers.js';
import { importUnitLabel, inventoryImportColumnLabel } from './inventoryImportConfig.js';
import { importKey, importText, loadMaterialImportCatalogs, materialImportIdentity } from './inventoryImportContext.js';

const articleType = value => {
    const type = importText(value).toUpperCase();
    return type === 'CONSUMIBLE' ? MATERIAL_TYPES.CONSUMABLE : type;
};
export const articleImportSnapshot = item => ({
    name: item.name, type: item.type === MATERIAL_TYPES.CONSUMABLE ? 'Consumible' : 'Material',
    presentation: item.presentation.name, unit: importUnitLabel(item.unitMeasure),
    base: toNumber(item.base), height: toNumber(item.height)
});

const selectedCatalog = (label, current, lookup, describe) =>
    current && importKey(describe(current)) === importKey(label) ? current : lookup.get(importKey(label));

const readArticleRow = ({ input, config, context, targets }) => {
    const body = input.values;
    const editing = config.mode === modes.UPDATE;
    const id = editing && UUID_V4_PATTERN.test(importText(body.id)) ? importText(body.id) : null;
    const current = context.articles.get(id);
    const name = typeof body.name === 'string' ? body.name.trim() : body.name;
    const before = current ? articleImportSnapshot(current) : null;
    const result = { row: input.row, id, name: String(name ?? ''), before, after: null, details: {},
        action: actions.ERROR, errors: [], warnings: [], reference: null };
    const add = (field, message, code = errorMap.inventoryImport.VALIDATION) =>
        result.errors.push({ field, column: inventoryImportColumnLabel(config, field), message, code });

    if (editing) {
        if (!current) add('id', 'El artículo no está disponible. Descarga una plantilla nueva.');
        else {
            const expectedVersion = /^[0-9]+$/.test(String(body.expectedVersion ?? '')) ? Number(body.expectedVersion) : -1;
            if (expectedVersion !== current.version) add('expectedVersion', 'El artículo cambió desde que descargaste la plantilla.');
            if (targets.has(id)) add('id', 'El artículo está repetido en el archivo.');
            targets.add(id);
        }
    }

    const presentation = selectedCatalog(body.presentationName, current?.presentation, context.presentationNames, item => item.name);
    const unit = selectedCatalog(body.unitLabel, current?.unitMeasure, context.unitLabels, importUnitLabel);
    const capture = {
        name, type: articleType(body.type), presentationId: presentation?.id, unitMeasureId: unit?.id,
        base: body.base === '' ? null : body.base ?? null,
        height: body.height === '' ? null : body.height ?? null
    };
    for (const [field, rule] of Object.entries(materialCatalogValidation)) {
        const message = rule(capture[field], capture);
        if (message) add({ presentationId: 'presentationName', unitMeasureId: 'unitLabel' }[field] ?? field, message);
    }
    if (result.errors.length) return result;

    const material = applyUnitPresentationMeasurements({
        ...capture, base: toNumber(capture.base), height: toNumber(capture.height)
    }, presentation);
    const linked = (current?._count.supplierMaterials ?? 0) > 0;
    const changedIdentity = !current || materialCatalogIdentityChanged(current, material);
    if (linked && changedIdentity) {
        const error = new MaterialIdentityLinkedConflict();
        add('name', error.message, error.code);
    } else if (changedIdentity) {
        if (!presentation.isActive) add('presentationName', 'Selecciona una presentación activa.');
        if (!unit.isActive) add('unitLabel', 'Selecciona una unidad activa.');
        const message = getMaterialMeasurementError({ material, presentation, unit, type: material.type });
        if (message) add('height', message, errorMap.materialMeasurements.INVALID);
    }
    if (result.errors.length) return result;

    result.after = articleImportSnapshot({ ...material, presentation, unitMeasure: unit });
    result.reference = { material, linked, presentationVersion: presentation.version, unitVersion: unit.version };
    result.dto = { name, type: material.type, presentationName: presentation.name, unitLabel: importUnitLabel(unit),
        base: material.base, height: material.height, ...(editing && { expectedVersion: current.version }) };
    result.action = !editing ? actions.CREATE : isDeepStrictEqual(before, result.after) ? actions.UNCHANGED : actions.UPDATE;
    return result;
};

export const validateArticleImportRows = async ({ db, config, rows }) => {
    const values = rows.map(row => row.values);
    const context = await loadMaterialImportCatalogs({ db, values });
    const ids = [...new Set(values.map(row => importText(row.id)).filter(id => UUID_V4_PATTERN.test(id)))];
    const articles = config.mode === modes.UPDATE && ids.length ? await db.material.findMany({
        where: { id: { in: ids } },
        include: { presentation: true, unitMeasure: true, _count: { select: { supplierMaterials: true } } }
    }) : [];
    context.articles = new Map(articles.map(article => [article.id, article]));

    const targets = new Set();
    const results = rows.map(input => readArticleRow({ input, config, context, targets }));
    const candidates = results.filter(row => row.reference);
    if (!candidates.length) return { rows: results, context };

    const probes = candidates.map(({ reference: { material } }) => ({
        ...material, name: { equals: material.name, mode: 'insensitive' }
    }));
    const existing = await db.material.findMany({ where: { OR: probes }, take: candidates.length + 1 });
    const identities = new Map(existing.map(item => [materialImportIdentity(item), item.id]));
    const proposed = new Set();
    for (const row of candidates) {
        const identity = materialImportIdentity(row.reference.material);
        if (proposed.has(identity) || (identities.has(identity) && identities.get(identity) !== row.id)) {
            row.errors.push({ field: 'name', column: inventoryImportColumnLabel(config, 'name'),
                code: errorMap.inventoryImport.VALIDATION, message: 'La identidad resultante corresponde a otro artículo.' });
            row.action = actions.ERROR;
        }
        proposed.add(identity);
    }
    return { rows: results, context };
};

export const writeArticleImport = async ({ tx, config, rows, context }) => {
    const { presentations, units } = context;
    await lockInventoryImportReferences({ tx, context: {
        presentations, units, suppliers: new Map(), offers: new Map(), identities: new Map()
    } });
    if (config.mode === modes.CREATE) {
        const data = rows.map(row => ({ id: randomUUID(), ...row.reference.material }));
        await tx.material.createMany({ data });
        return new Map(rows.map((row, index) => [row.row, data[index].id]));
    }
    for (const row of [...rows].sort((left, right) => left.id.localeCompare(right.id))) {
        await updateMaterialCatalogEntry(row.id, {
            ...row.reference.material, expectedVersion: row.dto.expectedVersion
        }, { tx, context });
    }
    return new Map(rows.map(row => [row.row, row.id]));
};
