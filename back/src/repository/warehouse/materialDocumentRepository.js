// Se ejecuta antes de cambiar una ficha sin oferta. SQL mantiene las fechas de los documentos.
export const preserveMaterialSpecifications = ({ tx, materialId, type, specification }) => {
    const snapshot = JSON.stringify(specification);
    return tx.$executeRaw`
        WITH receipt_details AS (
            UPDATE "GoodsReceiptDetail"
            SET "materialType" = ${type}::"MaterialType", "materialSpecification" = ${snapshot}::jsonb
            WHERE "materialId" = ${materialId}::uuid AND "materialType" IS NULL
        ), issue_details AS (
            UPDATE "GoodsIssueDetail"
            SET "materialType" = ${type}::"MaterialType", "materialSpecification" = ${snapshot}::jsonb
            WHERE "materialId" = ${materialId}::uuid AND "materialType" IS NULL
        )
        UPDATE "MovementDetail"
        SET "materialType" = ${type}::"MaterialType", "materialSpecification" = ${snapshot}::jsonb
        WHERE "materialId" = ${materialId}::uuid AND "materialType" IS NULL
    `;
};
