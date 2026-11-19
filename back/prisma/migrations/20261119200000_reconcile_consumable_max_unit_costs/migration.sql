WITH purchase_costs AS (
    SELECT detail."materialId", receipt."supplierId", MAX(detail."conversionUnitCost") AS unit_cost
    FROM "GoodsReceiptDetail" AS detail
    JOIN "GoodsReceipt" AS receipt ON receipt.id = detail."goodsReceiptId"
    JOIN "Status" AS status ON status.id = receipt."statusId"
    WHERE receipt.type = 'CONSUMABLE'
        AND status.name = 'Confirmada'
        AND detail.status = 'ACTIVE'
        AND (detail."materialType" IS NULL OR detail."materialType" = 'CONSUMABLE')
        AND detail."materialSpecification" IS NULL
        AND detail."conversionUnitCost" > 0
    GROUP BY detail."materialId", receipt."supplierId"
)
UPDATE "SupplierMaterial" AS offer
SET "maxUnitCost" = purchase_costs.unit_cost
FROM purchase_costs, "Material" AS material
WHERE offer."materialId" = purchase_costs."materialId"
    AND offer."supplierId" = purchase_costs."supplierId"
    AND material.id = offer."materialId"
    AND material.type = 'CONSUMABLE'
    AND COALESCE(offer."maxUnitCost", 0) < purchase_costs.unit_cost;
