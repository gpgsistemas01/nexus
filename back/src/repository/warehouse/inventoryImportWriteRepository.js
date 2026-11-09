import { Prisma } from '../../../generated/prisma/client.ts';
import { RecordVersionConflictError } from '../../errors/concurrencyError.js';

const requireEveryRow = (rows, count) => { if (rows.length !== count) throw new RecordVersionConflictError(); };

export const lockInventoryImport = ({ tx, id, userId }) => tx.$queryRaw`
    SELECT "id" FROM "InventoryImport" WHERE "id" = ${id}::uuid AND "userId" = ${userId}::uuid FOR UPDATE
`;

export const tryLockInventoryImportConfirmation = async ({ tx }) => {
    const [gate] = await tx.$queryRaw`SELECT pg_try_advisory_xact_lock(733040, 1) AS allowed`;
    return gate.allowed;
};

export const lockInventoryStockCount = async ({ tx, context }) => {
    const materials = new Map([...context.offers.values()].map(offer => [offer.material.id, offer.material]));
    const presentations = new Map([...materials.values(), ...context.wastes.values()].map(item => [item.presentation.id, item.presentation]));
    const sources = [
        ['StockAdjustmentReason', [...context.reasons.values()], false],
        ['Presentation', [...presentations.values()], false],
        ['Material', [...materials.values()], false],
        ['SupplierMaterial', [...context.offers.values()], true],
        ['Waste', [...context.wastes.values()], true]
    ];
    for (const [table, records, write] of sources) {
        if (!records.length) continue;
        const values = records.map(row => Prisma.sql`(${row.id}::uuid, ${row.version}::int)`);
        const locked = await tx.$queryRaw(Prisma.sql`
            WITH source(id, version) AS (VALUES ${Prisma.join(values)})
            SELECT item."id" FROM ${Prisma.raw(`"${table}"`)} item JOIN source
                ON item."id" = source.id AND item."version" = source.version
            ORDER BY ${Prisma.raw(table === 'SupplierMaterial' ? 'item."materialId", item."supplierId"' : 'item."id"')}
            ${Prisma.raw(write ? 'FOR UPDATE' : 'FOR SHARE')} OF item
        `);
        requireEveryRow(locked, records.length);
    }
};

export const lockInventoryImportReferences = async ({ tx, context }) => {
    // Los nombres de tabla son constantes internas; los IDs y versiones siempre se parametrizan.
    const materials = new Map([...context.identities.values(), ...[...context.offers.values()].map(offer => offer.material)].map(item => [item.id, item]));
    const presentations = new Map([...materials.values()].flatMap(item => item.presentation ? [[item.presentation.id, item.presentation]] : []));
    const units = new Map([...materials.values()].flatMap(item => item.unitMeasure ? [[item.unitMeasure.id, item.unitMeasure]] : []));
    for (const [id, item] of context.presentations) presentations.set(id, item);
    for (const [id, item] of context.units) units.set(id, item);
    const sources = [
        ['Supplier', [...context.suppliers.values()]], ['Presentation', [...presentations.values()]],
        ['UnitMeasure', [...units.values()]], ['Material', [...materials.values()]],
        ['SupplierMaterial', [...context.offers.values()]]
    ];
    for (const [table, records] of sources) {
        if (!records.length) continue;
        const values = records.map(row => Prisma.sql`(${row.id}::uuid, ${row.version}::int)`);
        const locked = await tx.$queryRaw(Prisma.sql`
            WITH source(id, version) AS (VALUES ${Prisma.join(values)})
            SELECT item."id" FROM ${Prisma.raw(`"${table}"`)} item JOIN source
                ON item."id" = source.id AND item."version" = source.version
            ORDER BY item."id" FOR SHARE OF item
        `);
        requireEveryRow(locked, records.length);
    }
};

export const updateImportedMaterials = async ({ tx, type, materials, offers }) => {
    if (!materials.length) return;
    const shared = materials.map(row => Prisma.sql`(${row.id}::uuid, ${row.version}::int, ${row.name}::text, ${row.minStock}::numeric)`);
    const changed = await tx.$queryRaw(Prisma.sql`
        WITH source(id, version, name, minimum) AS (VALUES ${Prisma.join(shared)}),
        locked AS MATERIALIZED (
            SELECT item."id" FROM "Material" item JOIN source ON item."id" = source.id
            ORDER BY item."id" FOR UPDATE OF item
        )
        UPDATE "Material" item SET "name" = source.name, "minStock" = source.minimum
        FROM source, locked WHERE item."id" = source.id AND item."id" = locked."id"
            AND item."version" = source.version AND item."type" = ${type}::"MaterialType"
        RETURNING item."id"
    `);
    requireEveryRow(changed, materials.length);
    const suppliers = offers.map(row => Prisma.sql`(${row.materialId}::uuid, ${row.supplierId}::uuid, ${row.version}::int, ${row.maxUnitCost}::numeric, ${row.isActive}::boolean)`);
    const updated = await tx.$queryRaw(Prisma.sql`
        WITH source(material_id, supplier_id, version, cost, active) AS (VALUES ${Prisma.join(suppliers)}),
        locked AS MATERIALIZED (
            SELECT item."id" FROM "SupplierMaterial" item JOIN source
                ON item."materialId" = source.material_id AND item."supplierId" = source.supplier_id
            ORDER BY item."materialId", item."supplierId" FOR UPDATE OF item
        )
        UPDATE "SupplierMaterial" item SET "maxUnitCost" = source.cost, "isActive" = source.active
        FROM source, locked WHERE item."id" = locked."id" AND item."materialId" = source.material_id
            AND item."supplierId" = source.supplier_id AND item."version" = source.version
        RETURNING item."id"
    `);
    requireEveryRow(updated, offers.length);
};

export const updateImportedWastes = async ({ tx, changes }) => {
    if (!changes.length) return;
    const values = changes.map(row => Prisma.sql`(${row.id}::uuid, ${row.version}::int, ${row.name}::text,
        ${row.minStock}::numeric, ${row.maxUnitCost}::numeric, ${row.isActive}::boolean)`);
    const updated = await tx.$queryRaw(Prisma.sql`
        WITH source(id, version, name, minimum, cost, active) AS (VALUES ${Prisma.join(values)}),
        locked AS MATERIALIZED (
            SELECT item."id" FROM "Waste" item JOIN source ON item."id" = source.id
            ORDER BY item."id" FOR UPDATE OF item
        )
        UPDATE "Waste" item SET "name" = source.name, "minStock" = source.minimum,
            "maxUnitCost" = source.cost, "isActive" = source.active, "updatedAt" = ${new Date()}
        FROM source, locked WHERE item."id" = source.id AND item."id" = locked."id" AND item."version" = source.version
        RETURNING item."id"
    `);
    requireEveryRow(updated, changes.length);
};
