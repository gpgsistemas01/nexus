BEGIN;

ALTER TABLE "InventoryImport"
    DROP CONSTRAINT "InventoryImport_resource_check",
    ADD CONSTRAINT "InventoryImport_resource_check"
        CHECK ("resource" IN ('materials', 'consumables', 'wastes', 'articles')),
    ADD CONSTRAINT "InventoryImport_article_mode_check"
        CHECK ("resource" <> 'articles' OR "mode" IN ('create', 'update'));

COMMIT;
