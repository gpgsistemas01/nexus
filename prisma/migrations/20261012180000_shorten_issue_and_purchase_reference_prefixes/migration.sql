BEGIN;

-- Freeze allocation and document writes while renaming the five annual series.
LOCK TABLE "ReferenceNumberCounter", "GoodsIssue", "GoodsReceipt", "WasteIssue"
IN SHARE ROW EXCLUSIVE MODE;

-- The stored context is authoritative, including documents classified by earlier migrations.
UPDATE "GoodsIssue"
SET "referenceNumber" = regexp_replace(
    "referenceNumber", '^(SAL|SAL-MAT|SAL-CON)-',
    CASE WHEN "type" = 'CONSUMABLE' THEN 'SCO-' ELSE 'SMA-' END
)
WHERE "referenceNumber" ~ '^(SAL|SAL-MAT|SAL-CON)-[0-9]{4}-[0-9]+$';

UPDATE "GoodsReceipt"
SET "referenceNumber" = regexp_replace(
    "referenceNumber", '^REC-',
    CASE WHEN "type" = 'CONSUMABLE' THEN 'CCO-' ELSE 'CMA-' END
)
WHERE "referenceNumber" ~ '^REC-[0-9]{4}-[0-9]+$';

-- Waste belongs to its own model and counter, never to SMA or SCO.
UPDATE "WasteIssue"
SET "referenceNumber" = regexp_replace("referenceNumber", '^(SAL-MER|SM)-', 'SME-')
WHERE "referenceNumber" ~ '^(SAL-MER|SM)-[0-9]{4}-[0-9]+$';

-- Preserve issued suffixes and historical high-water marks; never restart or lower a counter.
INSERT INTO "ReferenceNumberCounter" ("prefix", "year", "counter")
SELECT source."prefix", source."year", MAX(source."counter")
FROM (
    SELECT split_part(issue."referenceNumber", '-', 1) AS "prefix",
           split_part(issue."referenceNumber", '-', 2)::INTEGER AS "year",
           split_part(issue."referenceNumber", '-', 3)::INTEGER AS "counter"
    FROM "GoodsIssue" AS issue
    WHERE (issue."type" = 'MATERIAL' AND issue."referenceNumber" ~ '^SMA-[0-9]{4}-[0-9]+$')
       OR (issue."type" = 'CONSUMABLE' AND issue."referenceNumber" ~ '^SCO-[0-9]{4}-[0-9]+$')

    UNION ALL
    SELECT split_part(receipt."referenceNumber", '-', 1),
           split_part(receipt."referenceNumber", '-', 2)::INTEGER,
           split_part(receipt."referenceNumber", '-', 3)::INTEGER
    FROM "GoodsReceipt" AS receipt
    WHERE (receipt."type" = 'MATERIAL' AND receipt."referenceNumber" ~ '^CMA-[0-9]{4}-[0-9]+$')
       OR (receipt."type" = 'CONSUMABLE' AND receipt."referenceNumber" ~ '^CCO-[0-9]{4}-[0-9]+$')

    UNION ALL
    SELECT 'SME', split_part(waste."referenceNumber", '-', 2)::INTEGER,
           split_part(waste."referenceNumber", '-', 3)::INTEGER
    FROM "WasteIssue" AS waste
    WHERE waste."referenceNumber" ~ '^SME-[0-9]{4}-[0-9]+$'

    UNION ALL
    SELECT mapping."newPrefix", legacy."year", legacy."counter"
    FROM "ReferenceNumberCounter" AS legacy
    INNER JOIN (VALUES
        ('SAL', 'SMA'), ('SAL', 'SCO'),
        ('SAL-MAT', 'SMA'), ('SAL-CON', 'SCO'),
        ('REC', 'CMA'), ('REC', 'CCO'),
        ('SAL-MER', 'SME'), ('SM', 'SME')
    ) AS mapping("oldPrefix", "newPrefix") ON mapping."oldPrefix" = legacy."prefix"
    WHERE legacy."year" > 0
) AS source
GROUP BY source."prefix", source."year"
ON CONFLICT ("prefix", "year") DO UPDATE
SET "counter" = GREATEST("ReferenceNumberCounter"."counter", EXCLUDED."counter");

-- Legacy counters remain as history. A unique collision aborts every change above.
COMMIT;
