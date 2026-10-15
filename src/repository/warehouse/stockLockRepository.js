// Los ajustes absolutos necesitan leer el saldo después de obtener el bloqueo de escritura.
export const lockSupplierMaterialStock = ({ tx, materialId, supplierId }) => tx.$queryRaw`
    SELECT "id" FROM "SupplierMaterial"
    WHERE "materialId" = ${materialId}::uuid AND "supplierId" = ${supplierId}::uuid
    FOR UPDATE
`;

export const lockWasteStock = ({ tx, id }) => tx.$queryRaw`
    SELECT "id" FROM "Waste" WHERE "id" = ${id}::uuid FOR UPDATE
`;
