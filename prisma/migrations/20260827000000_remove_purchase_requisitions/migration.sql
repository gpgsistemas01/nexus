-- Remove the discontinued purchase requisition module and its generated folio counter.
DROP TABLE IF EXISTS "PurchaseRequisitionDetail";
DROP TABLE IF EXISTS "PurchaseRequisition";

DELETE FROM "ReferenceNumberCounter"
WHERE "prefix" = 'REQ';
