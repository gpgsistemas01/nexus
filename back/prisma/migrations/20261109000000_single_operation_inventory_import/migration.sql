BEGIN;

ALTER TABLE "InventoryImport" DROP CONSTRAINT "InventoryImport_mode_check";
ALTER TABLE "InventoryImport" ADD CONSTRAINT "InventoryImport_mode_check"
    CHECK ("mode" IN ('create', 'update', 'adjust'));

COMMIT;
