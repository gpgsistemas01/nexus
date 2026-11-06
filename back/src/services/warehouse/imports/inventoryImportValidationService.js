import { randomUUID } from 'node:crypto';
import { setImmediate } from 'node:timers/promises';
import { validateInventoryImportRow } from '../../../validators/forms/inventoryImportValidations.js';
import { UUID_V4_PATTERN } from '../../../shared/constants/inputValidation.js';
import { assertPieceQuantity } from '../../inventory/stockHelpers.js';
import { assertWasteMaterialReference, prepareWasteMeasurements } from '../wastes/wasteHelpers.js';
import { createMaterialDtoForRegister, createMaterialDtoForEdit } from '../../../dtos/materialDTO.js';
import { createWasteDtoForRegister, createWasteDtoForEdit } from '../../../dtos/wasteDTO.js';
import { loadInventoryImportContext, importKey, importReferenceId, materialImportIdentity, wasteImportIdentity } from './inventoryImportContext.js';

const snapshot = (item, material = item) => ({
    name: material.name, minStock: Number(material.minStock),
    maxUnitCost: item.maxUnitCost == null ? null : Number(item.maxUnitCost), isActive: item.isActive
});
const editable = dto => ({ name: dto.name, minStock: dto.minStock ?? 0, maxUnitCost: dto.maxUnitCost, isActive: dto.isActive });
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const issue = (field, message, code = 'INVENTORY_IMPORT_VALIDATION') => ({ field, message, code });

export const validateInventoryImportRows = async ({ db, config, rows }) => {
    const context = await loadInventoryImportContext({ db, config, rows });
    const results = [];
    const targets = new Map();
    const shared = new Map();
    for (const input of rows) {
        const body = { ...input.values };
        const errors = [];
        const warnings = [];
        const add = (field, message) => errors.push(issue(field, message));
        if (config.mode === 'create') {
            body.supplierId ||= context.supplierCodes.get(importKey(body.supplierCode))?.id ?? '';
            if (body.minStock === '') body.minStock = 0;
            if (body.isActive === '') body.isActive = true;
            if (config.resource !== 'wastes') {
                body.presentationId ||= context.presentationNames.get(importKey(body.presentationName))?.id ?? '';
                body.unitMeasureId ||= context.unitLabels.get(importKey(body.unitLabel))?.id ?? '';
            } else {
                body.operationId = randomUUID();
                body.materialId = importReferenceId(body.materialId);
            }
        } else {
            if (!UUID_V4_PATTERN.test(String(body.id ?? ''))) add('id', 'El identificador del registro no es válido.');
            for (const field of ['name', 'minStock', 'maxUnitCost', 'isActive']) {
                if (body[field] === '' || body[field] == null) add(field, 'Conserva un valor válido en la columna de actualización.');
            }
        }
        if (typeof body.isActive === 'string') {
            const value = body.isActive.toUpperCase();
            if (['SI', 'SÍ', 'TRUE', '1'].includes(value)) body.isActive = true;
            else if (['NO', 'FALSE', '0'].includes(value)) body.isActive = false;
        }
        for (const field of ['base', 'height', 'coneWeightKg', 'totalWeightKg', 'referenceRollTotalWeightKg']) {
            if (body[field] === '' || body[field] == null) delete body[field];
        }
        const validated = await validateInventoryImportRow({ ...config, body });
        errors.push(...validated.errors);
        let dto;
        let before = null;
        let reference = null;
        let identity;
        const supplier = context.suppliers.get(body.supplierId);
        const target = config.resource === 'wastes' ? context.wastes.get(body.id)
            : context.offers.get(`${body.id}:${body.supplierId}`);
        if (config.mode === 'create' && !supplier) add('supplierCode', 'El código del proveedor no existe.');
        if (config.mode === 'create' && supplier?.isActive === false) add('supplierCode', 'El proveedor está inactivo.');
        if (config.mode === 'update' && (!target || (config.type && target.material.type !== config.type))) {
            add('id', 'El registro o proveedor no corresponde a este módulo.');
        }
        if (!errors.length) {
            dto = config.resource === 'wastes'
                ? config.mode === 'create' ? createWasteDtoForRegister(validated.body) : createWasteDtoForEdit(validated.body)
                : config.mode === 'create' ? createMaterialDtoForRegister(validated.body) : createMaterialDtoForEdit(validated.body);
            let domainField = 'minStock';
            try {
                if (config.mode === 'update') {
                    if (target.version !== dto.expectedVersion
                        || (config.type && target.material.version !== dto.expectedMaterialVersion)) {
                        add('expectedVersion', 'El registro cambió desde que se descargó la plantilla.');
                    }
                    before = snapshot(target, target.material ?? target);
                    assertPieceQuantity({ quantity: dto.minStock, item: target.material ?? target });
                    identity = config.type ? `${body.id}:${body.supplierId}` : body.id;
                    if (config.type) {
                        const signature = JSON.stringify([dto.name, dto.minStock, dto.expectedMaterialVersion]);
                        if (shared.has(body.id) && shared.get(body.id) !== signature) add('name', 'Las filas del mismo material deben conservar iguales nombre, mínimo y versión del material.');
                        shared.set(body.id, signature);
                    }
                } else if (config.resource === 'wastes') {
                    domainField = 'materialId';
                    const offer = context.offers.get(`${dto.materialId}:${dto.supplierId}`);
                    if (!offer) {
                        add('materialId', 'Selecciona un material activo del proveedor con unidad de m².');
                    } else {
                        assertWasteMaterialReference(offer);
                        domainField = dto.coneWeightKg == null ? 'base' : 'totalWeightKg';
                        const measurements = prepareWasteMeasurements({ wasteDto: dto, offer });
                        domainField = 'minStock';
                        assertPieceQuantity({ quantity: dto.minStock, item: offer.material });
                        domainField = 'initialQuantity';
                        assertPieceQuantity({ quantity: dto.initialQuantity, item: offer.material });
                        reference = { materialVersion: offer.material.version, supplierVersion: offer.version, ...measurements };
                        identity = wasteImportIdentity({ ...dto, ...measurements });
                    }
                } else {
                    const presentation = context.presentations.get(dto.presentationId);
                    if (!presentation || !context.units.has(dto.unitMeasureId)) add('presentationName', 'Presentación o unidad inexistente, inactiva o ambigua.');
                    else {
                        assertPieceQuantity({ quantity: dto.minStock, item: { presentation } });
                        domainField = 'newStock';
                        assertPieceQuantity({ quantity: dto.newStock, item: { presentation } });
                        const materialIdentity = materialImportIdentity({ ...dto, type: config.type });
                        const existing = context.identities.get(materialIdentity);
                        if (existing && context.offers.has(`${existing.id}:${dto.supplierId}`)) add('name', 'Este artículo ya existe para el proveedor. Utiliza una plantilla de actualización.');
                        if (existing && Number(existing.minStock) !== Number(dto.minStock)) add('minStock', 'El mínimo pertenece al material existente. Conserva su valor o actualízalo por separado.');
                        if (existing && existing.name !== dto.name) add('name', 'Conserva el nombre del material existente o modifícalo mediante una actualización.');
                        const signature = JSON.stringify([dto.name, dto.minStock]);
                        if (shared.has(materialIdentity) && shared.get(materialIdentity) !== signature) add('name', 'El mismo material debe conservar nombre y mínimo comunes entre proveedores.');
                        shared.set(materialIdentity, signature);
                        reference = { materialVersion: existing?.version ?? null, materialId: existing?.id ?? null };
                        identity = `${materialIdentity}:${dto.supplierId}`;
                        if (!context.initialStockReason) add('newStock', 'Falta configurar el motivo Stock inicial.');
                    }
                }
            } catch (error) {
                if (!error.isOperational) throw error;
                errors.push(issue(domainField, error.message, error.code));
            }
            if (identity && targets.has(identity)) add('name', `El registro está repetido: coincide con la fila ${targets.get(identity)} del archivo.`);
            else if (identity) targets.set(identity, input.row);
            if (config.mode === 'create' && dto.maxUnitCost === 0) warnings.push('Alta sin costo: no podrá usarse en salidas hasta configurar un costo mayor que cero en Almacén.');
        }
        const after = dto ? editable(dto) : null;
        const details = config.mode === 'create' && dto ? {
            supplier: supplier?.tradeName ?? '', supplierCode: supplier?.code ?? '',
            ...(config.resource === 'wastes' ? { materialId: dto.materialId,
                sourceMaterial: context.offers.get(`${dto.materialId}:${dto.supplierId}`)?.material.name ?? '', ...reference,
                initialQuantity: dto.initialQuantity, coneWeightKg: dto.coneWeightKg ?? null,
                totalWeightKg: dto.totalWeightKg ?? null, referenceRollTotalWeightKg: dto.referenceRollTotalWeightKg ?? null }
                : { presentation: context.presentations.get(dto.presentationId)?.name ?? '',
                    unit: context.units.get(dto.unitMeasureId)?.symbol ?? '', base: dto.base, height: dto.height, initialQuantity: dto.newStock }),
            observations: dto.observations ?? ''
        } : config.mode === 'update' && target ? { supplier: target.supplier?.tradeName ?? '', supplierCode: target.supplier?.code ?? '' } : {};
        const action = errors.length ? 'error' : config.mode === 'create' ? 'create' : same(before, after) ? 'unchanged' : 'update';
        results.push({ row: input.row, id: body.id ?? null, name: String(body.name ?? ''), before, after, details,
            action, errors: errors.map(error => ({ ...error, column: config.columns.find(([, key]) => key === error.field)?.[0] ?? error.field })),
            warnings, ...(dto && { dto }), reference });
        if (results.length % 5 === 0) await setImmediate();
    }
    // Consultas por identidad exacta y acotadas al archivo; nunca cargar todo un inventario por nombre.
    const candidates = results.filter(row => row.dto && !row.errors.length);
    const probes = candidates.map(row => {
        if (config.resource === 'wastes') {
            const source = config.mode === 'create' ? { ...row.dto, ...row.reference } : context.wastes.get(row.id);
            return { supplierId: source.supplierId, name: row.dto.name, base: source.base, height: source.height,
                coneWeightKg: source.coneWeightKg ?? null, totalWeightKg: source.totalWeightKg ?? null };
        }
        const source = config.mode === 'create' ? row.dto : context.offers.get(`${row.id}:${row.dto.supplierId}`).material;
        return { name: { equals: row.dto.name, mode: 'insensitive' }, type: config.type,
            presentationId: source.presentationId, unitMeasureId: source.unitMeasureId, base: source.base ?? null, height: source.height ?? null };
    });
    if (probes.length) {
        const existing = config.resource === 'wastes'
            ? await db.waste.findMany({ where: { OR: probes }, take: candidates.length + 1 })
            : await db.material.findMany({ where: { OR: probes }, take: candidates.length + 1 });
        const identities = new Map(existing.map(item => [config.resource === 'wastes' ? wasteImportIdentity(item) : materialImportIdentity(item), item.id]));
        const proposed = new Map();
        for (let index = 0; index < candidates.length; index++) {
            const row = candidates[index];
            const probe = probes[index];
            const identity = config.resource === 'wastes' ? wasteImportIdentity(probe)
                : materialImportIdentity({ ...probe, name: row.dto.name });
            const existingId = identities.get(identity);
            const conflict = config.mode === 'update' ? existingId && existingId !== row.id
                : config.resource === 'wastes' && existingId;
            const previous = proposed.get(identity);
            if (conflict || (previous && config.mode === 'update' && previous !== row.id)) {
                const message = config.mode === 'create' && config.resource === 'wastes'
                    ? 'Esta merma ya está registrada. Usa Actualizar datos para corregirla o Agregar stock para recibir otras unidades.'
                    : 'La identidad resultante corresponde a otro registro.';
                row.errors.push({ ...issue('name', message), column: 'nombre' });
                row.action = 'error';
            }
            proposed.set(identity, row.id);
        }
    }
    return { context, rows: results, summary: {
        total: results.length, creates: results.filter(row => row.action === 'create').length,
        updates: results.filter(row => row.action === 'update').length,
        unchanged: results.filter(row => row.action === 'unchanged').length,
        errors: results.filter(row => row.action === 'error').length
    } };
};
