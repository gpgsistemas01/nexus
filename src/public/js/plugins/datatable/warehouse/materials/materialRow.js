export const mapMaterialRowToFormData = (row = {}) => ({
    ...row,
    ...row.material,
    id: row.material?.id ?? row.materialId ?? row.id,
    version: row.version,
    supplier: row.supplier ?? row.material?.supplier,
    maxUnitCost: row.maxUnitCost ?? row.material?.maxUnitCost
});
