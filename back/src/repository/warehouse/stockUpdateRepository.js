import { Prisma } from '../../../generated/prisma/client.ts';

// Bloquear antes de escribir mantiene un orden común entre documentos con artículos compartidos.
// El servicio verifica todas las filas devueltas y revierte su tx si falta alguna existencia.
export const updateSupplierMaterialStocks = ({ tx, changes }) => {
    if (!changes.length) return [];

    const values = changes.map(change => Prisma.sql`(
        ${change.materialId}::uuid, ${change.supplierId}::uuid,
        ${change.quantityChange}::numeric, ${change.convertedQuantityChange}::numeric
    )`);

    return tx.$queryRaw(Prisma.sql`
        WITH changes(material_id, supplier_id, quantity, converted) AS (VALUES ${Prisma.join(values)}),
        locked AS MATERIALIZED (
            SELECT stock."id" FROM "SupplierMaterial" AS stock
            JOIN changes ON stock."materialId" = changes.material_id AND stock."supplierId" = changes.supplier_id
            ORDER BY stock."materialId", stock."supplierId" FOR UPDATE OF stock
        )
        UPDATE "SupplierMaterial" AS stock
        SET "currentStock" = stock."currentStock" + changes.quantity,
            "convertedQuantity" = stock."convertedQuantity" + changes.converted
        FROM changes, locked
        WHERE stock."id" = locked."id"
            AND stock."materialId" = changes.material_id AND stock."supplierId" = changes.supplier_id
            AND (changes.quantity >= 0 OR stock."currentStock" >= -changes.quantity)
        RETURNING stock."materialId", stock."supplierId", stock."currentStock"
    `);
};

export const updateWasteStocks = ({ tx, changes }) => {
    if (!changes.length) return [];

    const values = changes.map(change => Prisma.sql`(
        ${change.id}::uuid, ${change.quantityChange}::numeric, ${change.convertedQuantityChange}::numeric
    )`);

    return tx.$queryRaw(Prisma.sql`
        WITH changes(id, quantity, converted) AS (VALUES ${Prisma.join(values)}),
        locked AS MATERIALIZED (
            SELECT stock."id" FROM "Waste" AS stock JOIN changes ON stock."id" = changes.id
            ORDER BY stock."id" FOR UPDATE OF stock
        )
        UPDATE "Waste" AS stock
        SET "currentStock" = stock."currentStock" + changes.quantity,
            "convertedQuantity" = stock."convertedQuantity" + changes.converted,
            "updatedAt" = ${new Date()}
        FROM changes, locked
        WHERE stock."id" = locked."id" AND stock."id" = changes.id
            AND (changes.quantity >= 0 OR stock."currentStock" >= -changes.quantity)
        RETURNING stock."id", stock."currentStock"
    `);
};
