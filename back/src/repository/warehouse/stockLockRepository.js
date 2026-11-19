import { Prisma } from '../../../generated/prisma/client.ts';

// Los ajustes absolutos necesitan leer el saldo después de obtener el bloqueo de escritura.
export const lockSupplierMaterialStock = ({ tx, materialId, supplierId }) => tx.$queryRaw`
    SELECT "id" FROM "SupplierMaterial"
    WHERE "materialId" = ${materialId}::uuid AND "supplierId" = ${supplierId}::uuid
    FOR UPDATE
`;

export const lockSupplierMaterialsForIssue = ({ tx, pairs, supplyImmediately }) => {
    if (!pairs.length) return [];
    const values = pairs.map(({ materialId, supplierId }) => Prisma.sql`(${materialId}::uuid, ${supplierId}::uuid)`);
    const lock = supplyImmediately ? Prisma.sql`FOR UPDATE` : Prisma.sql`FOR KEY SHARE`;
    return tx.$queryRaw`
        SELECT stock."id" FROM "SupplierMaterial" AS stock
        JOIN (VALUES ${Prisma.join(values)}) AS pair(material_id, supplier_id)
            ON stock."materialId" = pair.material_id AND stock."supplierId" = pair.supplier_id
        ORDER BY stock."materialId", stock."supplierId"
        ${lock} OF stock
    `;
};

export const lockSupplierMaterialForRemoval = ({ tx, id }) => tx.$queryRaw`
    SELECT "id" FROM "SupplierMaterial" WHERE "id" = ${id}::uuid FOR UPDATE
`;

export const lockWasteStock = ({ tx, id }) => tx.$queryRaw`
    SELECT "id" FROM "Waste" WHERE "id" = ${id}::uuid FOR UPDATE
`;

// La identidad se puede editar cuando no queda ningún proveedor vinculado.
export const lockMaterialIdentity = ({ tx, id, forEditing = false }) => forEditing
    ? tx.$queryRaw`SELECT id FROM "Material" WHERE id = ${id}::uuid FOR UPDATE`
    : tx.$queryRaw`SELECT id FROM "Material" WHERE id = ${id}::uuid FOR KEY SHARE`;

export const lockMaterialIdentitiesForPurchase = ({ tx, materialIds }) => {
    if (!materialIds.length) return [];
    return tx.$queryRaw`
        SELECT "id" FROM "Material"
        WHERE "id" IN (${Prisma.join(materialIds.map(id => Prisma.sql`${id}::uuid`))})
        ORDER BY "id" FOR KEY SHARE
    `;
};
