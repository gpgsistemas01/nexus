-- Remove the discontinued purchase requisition module only after every migration
-- that still reads or alters its historical tables has completed.
DROP TABLE IF EXISTS "PurchaseRequisitionDetail";
DROP TABLE IF EXISTS "PurchaseRequisition";

DELETE FROM "ReferenceNumberCounter"
WHERE "prefix" = 'REQ';
