BEGIN;

LOCK TABLE "ReferenceNumberCounter", "WasteStockAdjustment", "WasteStockEntry", "WasteMovement"
IN SHARE ROW EXCLUSIVE MODE;

-- Cambia el folio, sin reclasificar ajustes históricos como entradas ni alterar sus relaciones.
WITH folios AS (
    SELECT "id", regexp_match("referenceNumber", '^(AJU-MER|AME)-([0-9]{4})-([0-9]+)$') AS parts
    FROM "WasteStockAdjustment"
)
UPDATE "WasteStockAdjustment" AS document
SET "referenceNumber" = concat('AME-', parts[2], '-', lpad(parts[3], GREATEST(length(parts[3]), 6), '0'))
FROM folios
WHERE document."id" = folios."id" AND parts IS NOT NULL;

WITH folios AS (
    SELECT "id", regexp_match("referenceNumber", '^(ENT-MER|EME)-([0-9]{4})-([0-9]+)$') AS parts
    FROM "WasteStockEntry"
)
UPDATE "WasteStockEntry" AS document
SET "referenceNumber" = concat('EME-', parts[2], '-', lpad(parts[3], GREATEST(length(parts[3]), 6), '0'))
FROM folios
WHERE document."id" = folios."id" AND parts IS NOT NULL;

-- También conserva las referencias antiguas que no pertenecen a un documento individual.
WITH folios AS (
    SELECT "id", regexp_match("referenceNumber", '^(AJU-MER|AME|ENT-MER|EME)-([0-9]{4})-([0-9]+)$') AS parts
    FROM "WasteMovement"
)
UPDATE "WasteMovement" AS movement
SET "referenceNumber" = concat(
    CASE WHEN parts[1] IN ('AJU-MER', 'AME') THEN 'AME-' ELSE 'EME-' END,
    parts[2], '-', lpad(parts[3], GREATEST(length(parts[3]), 6), '0')
)
FROM folios
WHERE movement."id" = folios."id" AND parts IS NOT NULL;

-- Nunca reinicia una serie ni reduce un contador ya consumido, aunque no queden documentos.
INSERT INTO "ReferenceNumberCounter" ("prefix", "year", "counter")
SELECT source."prefix", source."year", MAX(source."counter")
FROM (
    SELECT 'AME' AS "prefix", split_part("referenceNumber", '-', 2)::INTEGER AS "year",
           split_part("referenceNumber", '-', 3)::INTEGER AS "counter"
    FROM "WasteStockAdjustment" WHERE "referenceNumber" ~ '^AME-[0-9]{4}-[0-9]+$'

    UNION ALL
    SELECT 'EME', split_part("referenceNumber", '-', 2)::INTEGER, split_part("referenceNumber", '-', 3)::INTEGER
    FROM "WasteStockEntry" WHERE "referenceNumber" ~ '^EME-[0-9]{4}-[0-9]+$'

    UNION ALL
    SELECT split_part("referenceNumber", '-', 1), split_part("referenceNumber", '-', 2)::INTEGER,
           split_part("referenceNumber", '-', 3)::INTEGER
    FROM "WasteMovement" WHERE "referenceNumber" ~ '^(AME|EME)-[0-9]{4}-[0-9]+$'

    UNION ALL
    SELECT mapping."newPrefix", legacy."year", legacy."counter"
    FROM "ReferenceNumberCounter" AS legacy
    JOIN (VALUES ('AJU-MER', 'AME'), ('ENT-MER', 'EME')) AS mapping("oldPrefix", "newPrefix")
      ON legacy."prefix" = mapping."oldPrefix"
    WHERE legacy."year" > 0
) AS source
GROUP BY source."prefix", source."year"
ON CONFLICT ("prefix", "year") DO UPDATE
SET "counter" = GREATEST("ReferenceNumberCounter"."counter", EXCLUDED."counter");

-- Una colisión de folios revierte documentos, referencias y contadores de todas las series.
COMMIT;
