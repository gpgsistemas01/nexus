-- PostgreSQL does not automatically index the referencing side of a foreign
-- key. Add only indexes backed by current filters, parent-to-child joins or
-- deletion checks; indexing every FK would add unnecessary write overhead.

CREATE INDEX "PersonRoleDepartment_roleId_idx" ON "PersonRoleDepartment"("roleId");
CREATE INDEX "PersonRoleDepartment_departmentId_idx" ON "PersonRoleDepartment"("departmentId");

CREATE INDEX "Notification_departmentId_idx" ON "Notification"("departmentId");
CREATE INDEX "Client_advisorId_idx" ON "Client"("advisorId");

CREATE INDEX "GoodsReceipt_supplierId_idx" ON "GoodsReceipt"("supplierId");
CREATE INDEX "GoodsReceipt_statusId_idx" ON "GoodsReceipt"("statusId");
CREATE INDEX "GoodsReceipt_receivedById_idx" ON "GoodsReceipt"("receivedById");
CREATE INDEX "GoodsReceiptDetail_goodsReceiptId_idx" ON "GoodsReceiptDetail"("goodsReceiptId");
CREATE INDEX "GoodsReceiptDetail_materialId_idx" ON "GoodsReceiptDetail"("materialId");

CREATE INDEX "PurchaseRequisition_departmentId_idx" ON "PurchaseRequisition"("departmentId");
CREATE INDEX "PurchaseRequisitionDetail_purchaseRequisitionId_idx" ON "PurchaseRequisitionDetail"("purchaseRequisitionId");
CREATE INDEX "PurchaseRequisitionDetail_materialId_idx" ON "PurchaseRequisitionDetail"("materialId");

CREATE INDEX "GoodsIssue_departmentId_idx" ON "GoodsIssue"("departmentId");
CREATE INDEX "GoodsIssue_requesterId_idx" ON "GoodsIssue"("requesterId");
CREATE INDEX "GoodsIssue_clientId_idx" ON "GoodsIssue"("clientId");
CREATE INDEX "GoodsIssue_fulfillmentStatusId_idx" ON "GoodsIssue"("fulfillmentStatusId");

CREATE INDEX "GoodsIssueDetail_materialId_idx" ON "GoodsIssueDetail"("materialId");
CREATE INDEX "GoodsIssueDetail_supplierId_idx" ON "GoodsIssueDetail"("supplierId");
CREATE INDEX "GoodsIssueDetail_goodsIssueId_fulfillmentStatusId_idx" ON "GoodsIssueDetail"("goodsIssueId", "fulfillmentStatusId");

CREATE INDEX "InventoryMovement_goodsReceiptId_idx" ON "InventoryMovement"("goodsReceiptId");
CREATE INDEX "InventoryMovement_goodsIssueId_idx" ON "InventoryMovement"("goodsIssueId");

CREATE INDEX "MovementDetail_materialId_idx" ON "MovementDetail"("materialId");
CREATE INDEX "MovementDetail_supplierId_idx" ON "MovementDetail"("supplierId");
CREATE INDEX "MovementDetail_movementId_idx" ON "MovementDetail"("movementId");

CREATE INDEX "StockAdjustmentDetail_stockAdjustmentId_idx" ON "StockAdjustmentDetail"("stockAdjustmentId");
CREATE INDEX "StockAdjustmentDetail_materialId_idx" ON "StockAdjustmentDetail"("materialId");
CREATE INDEX "StockAdjustmentDetail_supplierId_idx" ON "StockAdjustmentDetail"("supplierId");
