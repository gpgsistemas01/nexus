-- Separate the two issue series without renumbering issued documents. The
-- preceding type migration already classifies consumable-only legacy issues.
-- Keep IDs, year, numeric suffix, details, movements and stock unchanged.
BEGIN;

-- Prevent document/counter writes while the old folios and high-water marks
-- are converted. A unique-key conflict rolls back the entire migration.
-- Follow creation's lock order: counter before document.
LOCK TABLE "ReferenceNumberCounter", "GoodsIssue" IN SHARE ROW EXCLUSIVE MODE;

UPDATE "GoodsIssue"
SET "referenceNumber" = regexp_replace(
    "referenceNumber",
    '^SAL-',
    CASE WHEN "type" = 'CONSUMABLE' THEN 'SAL-CON-' ELSE 'SAL-MAT-' END
)
WHERE "referenceNumber" ~ '^SAL-[0-9]{4}-[0-9]+$';

-- Each new series starts above both its issued suffixes and the former shared
-- counter. Preserve larger existing counters; never reset or reuse a consumed
-- sequence value. The retired SAL counter is retained as historical evidence.
INSERT INTO "ReferenceNumberCounter" ("prefix", "year", "counter")
SELECT source."prefix", source."year", MAX(source."counter")
FROM (
    SELECT
        CASE WHEN issue."type" = 'CONSUMABLE' THEN 'SAL-CON' ELSE 'SAL-MAT' END AS "prefix",
        split_part(issue."referenceNumber", '-', 3)::INTEGER AS "year",
        split_part(issue."referenceNumber", '-', 4)::INTEGER AS "counter"
    FROM "GoodsIssue" issue
    WHERE (issue."type" = 'MATERIAL' AND issue."referenceNumber" ~ '^SAL-MAT-[0-9]{4}-[0-9]+$')
       OR (issue."type" = 'CONSUMABLE' AND issue."referenceNumber" ~ '^SAL-CON-[0-9]{4}-[0-9]+$')

    UNION ALL

    SELECT series."prefix", legacy."year", legacy."counter"
    FROM "ReferenceNumberCounter" legacy
    CROSS JOIN (VALUES ('SAL-MAT'), ('SAL-CON')) AS series("prefix")
    WHERE legacy."prefix" = 'SAL' AND legacy."year" > 0
) source
GROUP BY source."prefix", source."year"
ON CONFLICT ("prefix", "year") DO UPDATE
SET "counter" = GREATEST("ReferenceNumberCounter"."counter", EXCLUDED."counter");

COMMIT;
