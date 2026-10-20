-- Consolidate the Material rows marked by the preceding migration. A material
-- is shared by its suppliers; supplier-specific stock and purchasing data stay
-- in SupplierMaterial and are redirected to the canonical Material row.
BEGIN;

LOCK TABLE
  "Material",
  "SupplierMaterial",
  "Waste",
  "GoodsReceiptDetail",
  "PurchaseRequisitionDetail",
  "GoodsIssueDetail",
  "MovementDetail",
  "StockAdjustmentDetail",
  "GoodsReceiptDetailChange",
  "GoodsIssueReturn",
  "WasteStockAdjustmentDetail",
  "WasteMovementDetail"
IN SHARE ROW EXCLUSIVE MODE;

CREATE TEMP TABLE material_merge_map (
  duplicate_id UUID PRIMARY KEY,
  canonical_id UUID NOT NULL
) ON COMMIT DROP;

INSERT INTO material_merge_map (duplicate_id, canonical_id)
SELECT duplicate."id", canonical."id"
FROM "Material" AS duplicate
JOIN "Material" AS canonical
  ON LOWER(canonical."name") = LOWER(
    LEFT(duplicate."name", LENGTH(duplicate."name") - 49)
  )
 AND canonical."presentationId" = duplicate."presentationId"
 AND canonical."unitMeasureId" = duplicate."unitMeasureId"
 AND COALESCE(canonical."base", -1::DECIMAL) = COALESCE(duplicate."base", -1::DECIMAL)
 AND COALESCE(canonical."height", -1::DECIMAL) = COALESCE(duplicate."height", -1::DECIMAL)
WHERE RIGHT(duplicate."name", 49) = ' [duplicado:' || duplicate."id"::TEXT || ']';

-- Historical operations reference Material directly. Redirect the foreign keys
-- but retain their snapshot name/dimension columns as an audit of the operation.
UPDATE "GoodsReceiptDetail" AS detail SET "materialId" = map.canonical_id
FROM material_merge_map AS map WHERE detail."materialId" = map.duplicate_id;
UPDATE "PurchaseRequisitionDetail" AS detail SET "materialId" = map.canonical_id
FROM material_merge_map AS map WHERE detail."materialId" = map.duplicate_id;
UPDATE "GoodsIssueDetail" AS detail SET "materialId" = map.canonical_id
FROM material_merge_map AS map WHERE detail."materialId" = map.duplicate_id;
UPDATE "MovementDetail" AS detail SET "materialId" = map.canonical_id
FROM material_merge_map AS map WHERE detail."materialId" = map.duplicate_id;
UPDATE "StockAdjustmentDetail" AS detail SET "materialId" = map.canonical_id
FROM material_merge_map AS map WHERE detail."materialId" = map.duplicate_id;
UPDATE "GoodsReceiptDetailChange" AS change SET "previousMaterialId" = map.canonical_id
FROM material_merge_map AS map WHERE change."previousMaterialId" = map.duplicate_id;
UPDATE "GoodsReceiptDetailChange" AS change SET "correctedMaterialId" = map.canonical_id
FROM material_merge_map AS map WHERE change."correctedMaterialId" = map.duplicate_id;
UPDATE "GoodsIssueReturn" AS detail SET "materialId" = map.canonical_id
FROM material_merge_map AS map WHERE detail."materialId" = map.duplicate_id;
UPDATE "WasteStockAdjustmentDetail" AS detail SET "materialId" = map.canonical_id
FROM material_merge_map AS map WHERE detail."materialId" = map.duplicate_id;

-- Move supplier relations that do not already exist on the canonical material.
UPDATE "SupplierMaterial" AS duplicate_supplier
SET "materialId" = map.canonical_id
FROM material_merge_map AS map
WHERE duplicate_supplier."materialId" = map.duplicate_id
  AND NOT EXISTS (
    SELECT 1
    FROM "SupplierMaterial" AS canonical_supplier
    WHERE canonical_supplier."materialId" = map.canonical_id
      AND canonical_supplier."supplierId" = duplicate_supplier."supplierId"
  );

-- A supplier can be attached to both legacy Material rows. In that case merge
-- its SupplierMaterial rows, including any waste identities, before deletion.
CREATE TEMP TABLE supplier_material_merge_map (
  duplicate_id UUID PRIMARY KEY,
  canonical_id UUID NOT NULL
) ON COMMIT DROP;

INSERT INTO supplier_material_merge_map (duplicate_id, canonical_id)
SELECT duplicate_supplier."id", canonical_supplier."id"
FROM "SupplierMaterial" AS duplicate_supplier
JOIN material_merge_map AS map ON map.duplicate_id = duplicate_supplier."materialId"
JOIN "SupplierMaterial" AS canonical_supplier
  ON canonical_supplier."materialId" = map.canonical_id
 AND canonical_supplier."supplierId" = duplicate_supplier."supplierId";

CREATE TEMP TABLE waste_merge_map (
  duplicate_id UUID PRIMARY KEY,
  canonical_id UUID NOT NULL
) ON COMMIT DROP;

INSERT INTO waste_merge_map (duplicate_id, canonical_id)
SELECT duplicate_waste."id", canonical_waste."id"
FROM "Waste" AS duplicate_waste
JOIN supplier_material_merge_map AS map
  ON map.duplicate_id = duplicate_waste."supplierMaterialId"
JOIN "Waste" AS canonical_waste
  ON canonical_waste."supplierMaterialId" = map.canonical_id
 AND COALESCE(canonical_waste."base", -1::DECIMAL) = COALESCE(duplicate_waste."base", -1::DECIMAL)
 AND COALESCE(canonical_waste."height", -1::DECIMAL) = COALESCE(duplicate_waste."height", -1::DECIMAL);

UPDATE "WasteStockAdjustmentDetail" AS detail SET "wasteId" = map.canonical_id
FROM waste_merge_map AS map WHERE detail."wasteId" = map.duplicate_id;
UPDATE "WasteMovementDetail" AS detail SET "wasteId" = map.canonical_id
FROM waste_merge_map AS map WHERE detail."wasteId" = map.duplicate_id;

UPDATE "Waste" AS canonical
SET
  "currentStock" = canonical."currentStock" + merged."currentStock",
  "convertedQuantity" = canonical."convertedQuantity" + merged."convertedQuantity",
  "minStock" = GREATEST(canonical."minStock", merged."minStock"),
  "isActive" = canonical."isActive" OR merged."isActive"
FROM (
  SELECT
    map.canonical_id,
    SUM(duplicate."currentStock") AS "currentStock",
    SUM(duplicate."convertedQuantity") AS "convertedQuantity",
    MAX(duplicate."minStock") AS "minStock",
    BOOL_OR(duplicate."isActive") AS "isActive"
  FROM waste_merge_map AS map
  JOIN "Waste" AS duplicate ON duplicate."id" = map.duplicate_id
  GROUP BY map.canonical_id
) AS merged
WHERE canonical."id" = merged.canonical_id;

DELETE FROM "Waste" AS duplicate USING waste_merge_map AS map
WHERE duplicate."id" = map.duplicate_id;

UPDATE "Waste" AS waste SET "supplierMaterialId" = map.canonical_id
FROM supplier_material_merge_map AS map
WHERE waste."supplierMaterialId" = map.duplicate_id;

UPDATE "SupplierMaterial" AS canonical
SET
  "currentStock" = canonical."currentStock" + merged."currentStock",
  "convertedQuantity" = canonical."convertedQuantity" + merged."convertedQuantity",
  "maxUnitCost" = GREATEST(canonical."maxUnitCost", merged."maxUnitCost"),
  "sku" = COALESCE(canonical."sku", merged."sku")
FROM (
  SELECT
    map.canonical_id,
    SUM(duplicate."currentStock") AS "currentStock",
    SUM(duplicate."convertedQuantity") AS "convertedQuantity",
    MAX(duplicate."maxUnitCost") AS "maxUnitCost",
    MAX(duplicate."sku") AS "sku"
  FROM supplier_material_merge_map AS map
  JOIN "SupplierMaterial" AS duplicate ON duplicate."id" = map.duplicate_id
  GROUP BY map.canonical_id
) AS merged
WHERE canonical."id" = merged.canonical_id;

DELETE FROM "SupplierMaterial" AS duplicate USING supplier_material_merge_map AS map
WHERE duplicate."id" = map.duplicate_id;

UPDATE "Material" AS canonical
SET
  "minStock" = GREATEST(canonical."minStock", merged."minStock"),
  "isActive" = canonical."isActive" OR merged."isActive"
FROM (
  SELECT
    map.canonical_id,
    MAX(duplicate."minStock") AS "minStock",
    BOOL_OR(duplicate."isActive") AS "isActive"
  FROM material_merge_map AS map
  JOIN "Material" AS duplicate ON duplicate."id" = map.duplicate_id
  GROUP BY map.canonical_id
) AS merged
WHERE canonical."id" = merged.canonical_id;

DELETE FROM "Material" AS duplicate USING material_merge_map AS map
WHERE duplicate."id" = map.duplicate_id;

COMMIT;
