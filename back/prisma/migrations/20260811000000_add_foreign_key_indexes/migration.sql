-- PostgreSQL does not automatically index the referencing side of a foreign
-- key. Add only indexes backed by current filters, parent-to-child joins or
-- deletion checks; indexing every FK would add unnecessary write overhead.

CREATE INDEX IF NOT EXISTS "PersonRoleDepartment_roleId_idx" ON "PersonRoleDepartment"("roleId");
CREATE INDEX IF NOT EXISTS "PersonRoleDepartment_departmentId_idx" ON "PersonRoleDepartment"("departmentId");

CREATE INDEX IF NOT EXISTS "Notification_departmentId_idx" ON "Notification"("departmentId");
CREATE INDEX IF NOT EXISTS "Client_advisorId_idx" ON "Client"("advisorId");

CREATE INDEX IF NOT EXISTS "GoodsReceipt_supplierId_idx" ON "GoodsReceipt"("supplierId");
CREATE INDEX IF NOT EXISTS "GoodsReceipt_statusId_idx" ON "GoodsReceipt"("statusId");
CREATE INDEX IF NOT EXISTS "GoodsReceipt_receivedById_idx" ON "GoodsReceipt"("receivedById");
CREATE INDEX IF NOT EXISTS "GoodsReceiptDetail_goodsReceiptId_idx" ON "GoodsReceiptDetail"("goodsReceiptId");
CREATE INDEX IF NOT EXISTS "GoodsReceiptDetail_materialId_idx" ON "GoodsReceiptDetail"("materialId");

CREATE INDEX IF NOT EXISTS "PurchaseRequisition_departmentId_idx" ON "PurchaseRequisition"("departmentId");
CREATE INDEX IF NOT EXISTS "PurchaseRequisitionDetail_purchaseRequisitionId_idx" ON "PurchaseRequisitionDetail"("purchaseRequisitionId");
CREATE INDEX IF NOT EXISTS "PurchaseRequisitionDetail_materialId_idx" ON "PurchaseRequisitionDetail"("materialId");

CREATE INDEX IF NOT EXISTS "GoodsIssue_departmentId_idx" ON "GoodsIssue"("departmentId");
CREATE INDEX IF NOT EXISTS "GoodsIssue_requesterId_idx" ON "GoodsIssue"("requesterId");
CREATE INDEX IF NOT EXISTS "GoodsIssue_clientId_idx" ON "GoodsIssue"("clientId");
CREATE INDEX IF NOT EXISTS "GoodsIssue_fulfillmentStatusId_idx" ON "GoodsIssue"("fulfillmentStatusId");

CREATE INDEX IF NOT EXISTS "GoodsIssueDetail_materialId_idx" ON "GoodsIssueDetail"("materialId");
CREATE INDEX IF NOT EXISTS "GoodsIssueDetail_supplierId_idx" ON "GoodsIssueDetail"("supplierId");
CREATE INDEX IF NOT EXISTS "GoodsIssueDetail_goodsIssueId_fulfillmentStatusId_idx" ON "GoodsIssueDetail"("goodsIssueId", "fulfillmentStatusId");

CREATE INDEX IF NOT EXISTS "InventoryMovement_goodsReceiptId_idx" ON "InventoryMovement"("goodsReceiptId");
CREATE INDEX IF NOT EXISTS "InventoryMovement_goodsIssueId_idx" ON "InventoryMovement"("goodsIssueId");

CREATE INDEX IF NOT EXISTS "MovementDetail_materialId_idx" ON "MovementDetail"("materialId");
CREATE INDEX IF NOT EXISTS "MovementDetail_supplierId_idx" ON "MovementDetail"("supplierId");
CREATE INDEX IF NOT EXISTS "MovementDetail_movementId_idx" ON "MovementDetail"("movementId");

CREATE INDEX IF NOT EXISTS "StockAdjustmentDetail_stockAdjustmentId_idx" ON "StockAdjustmentDetail"("stockAdjustmentId");
CREATE INDEX IF NOT EXISTS "StockAdjustmentDetail_materialId_idx" ON "StockAdjustmentDetail"("materialId");
CREATE INDEX IF NOT EXISTS "StockAdjustmentDetail_supplierId_idx" ON "StockAdjustmentDetail"("supplierId");
