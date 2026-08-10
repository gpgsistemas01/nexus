-- Material and waste identity is immutable. Keep only the material-name snapshot
-- required for historical document display and resolve every other attribute
-- through the document detail's foreign keys.
ALTER TABLE "WasteStockAdjustmentDetail"
  DROP COLUMN "materialId",
  DROP COLUMN "supplierId",
  DROP COLUMN "supplierName",
  DROP COLUMN "wasteBase",
  DROP COLUMN "wasteHeight";

ALTER TABLE "GoodsReceiptDetail"
  DROP COLUMN "presentationId",
  DROP COLUMN "presentationName",
  DROP COLUMN "unitMeasureId",
  DROP COLUMN "unitMeasureName",
  DROP COLUMN "unitMeasureSymbol",
  DROP COLUMN "materialBase",
  DROP COLUMN "materialHeight";

ALTER TABLE "GoodsIssueDetail"
  DROP COLUMN "presentationId",
  DROP COLUMN "presentationName",
  DROP COLUMN "unitMeasureId",
  DROP COLUMN "unitMeasureName",
  DROP COLUMN "unitMeasureSymbol",
  DROP COLUMN "supplierName",
  DROP COLUMN "materialBase",
  DROP COLUMN "materialHeight";

ALTER TABLE "GoodsIssueReturn"
  DROP COLUMN "supplierName",
  DROP COLUMN "materialBase",
  DROP COLUMN "materialHeight";

ALTER TABLE "MovementDetail"
  DROP COLUMN "materialBase",
  DROP COLUMN "materialHeight";

ALTER TABLE "StockAdjustmentDetail"
  DROP COLUMN "supplierName",
  DROP COLUMN "materialBase",
  DROP COLUMN "materialHeight";
