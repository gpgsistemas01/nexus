BEGIN;

-- Keep the allocation lock order used by document creation.
LOCK TABLE "ReferenceNumberCounter", "GoodsIssue", "GoodsReceipt"
IN SHARE ROW EXCLUSIVE MODE;

-- Earlier migrations copied SAL/REC into both of their replacement series.
-- Reconcile the four established counters with their own issued folios.
-- Include canceled documents and preserve every issued number and document.
WITH issued AS (
    SELECT split_part("referenceNumber", '-', 1) AS "prefix",
           split_part("referenceNumber", '-', 2)::INTEGER AS "year",
           MAX(split_part("referenceNumber", '-', 3)::INTEGER) AS "counter"
    FROM "GoodsIssue"
    WHERE "referenceNumber" ~ '^(SMA|SCO)-[0-9]{4}-[0-9]+$'
    GROUP BY 1, 2

    UNION ALL

    SELECT split_part("referenceNumber", '-', 1),
           split_part("referenceNumber", '-', 2)::INTEGER,
           MAX(split_part("referenceNumber", '-', 3)::INTEGER)
    FROM "GoodsReceipt"
    WHERE "referenceNumber" ~ '^(CMA|CCO)-[0-9]{4}-[0-9]+$'
    GROUP BY 1, 2
), source AS (
    SELECT "prefix", "year", 0 AS "counter"
    FROM "ReferenceNumberCounter"
    WHERE "prefix" IN ('SMA', 'SCO', 'CMA', 'CCO') AND "year" > 0

    UNION ALL

    SELECT "prefix", "year", "counter" FROM issued WHERE "year" > 0
)
INSERT INTO "ReferenceNumberCounter" ("prefix", "year", "counter")
SELECT "prefix", "year", MAX("counter")
FROM source
GROUP BY "prefix", "year"
ON CONFLICT ("prefix", "year") DO UPDATE
SET "counter" = EXCLUDED."counter";

-- Keep every registered annual series and the non-yearly supplier counter.
-- Old migration prefixes are not runtime series; no document is deleted here.
DELETE FROM "ReferenceNumberCounter"
WHERE "prefix" NOT IN ('SMA', 'SCO', 'SME', 'CMA', 'CCO', 'AJU', 'AME', 'EME', 'PRO');

COMMIT;
