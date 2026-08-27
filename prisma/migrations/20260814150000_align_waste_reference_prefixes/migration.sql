-- Waste adjustments use their own folio family instead of sharing AJU with
-- material adjustments. Seed each yearly counter from existing AJU-MER folios
-- produced by the original waste-adjustment backfill. The counter represents
-- the last assigned folio (not the next one); 0 is only the initial value when
-- no folio has been issued, and the generation service increments it before use.
INSERT INTO "ReferenceNumberCounter" ("prefix", "year", "counter")
SELECT
    'AJU-MER',
    parsed."year",
    MAX(parsed."counter")
FROM (
    SELECT
        split_part(adjustment."referenceNumber", '-', 3)::INTEGER AS "year",
        split_part(adjustment."referenceNumber", '-', 4)::INTEGER AS "counter"
    FROM "WasteStockAdjustment" adjustment
    WHERE adjustment."referenceNumber" ~ '^AJU-MER-[0-9]{4}-[0-9]{6}$'
) parsed
GROUP BY parsed."year"
ON CONFLICT ("prefix", "year") DO UPDATE
SET "counter" = GREATEST("ReferenceNumberCounter"."counter", EXCLUDED."counter");

-- Salidas use the same operation-context convention as waste adjustments:
-- SAL-MER and AJU-MER. Preserve both issued folios and consumed counter values.
UPDATE "WasteIssue"
SET "referenceNumber" = regexp_replace(
    "referenceNumber",
    '^SM-([0-9]{4})-([0-9]{6})$',
    'SAL-MER-\1-\2'
)
WHERE "referenceNumber" ~ '^SM-[0-9]{4}-[0-9]{6}$';

INSERT INTO "ReferenceNumberCounter" ("prefix", "year", "counter")
SELECT 'SAL-MER', source."year", MAX(source."counter")
FROM (
    SELECT "year", "counter"
    FROM "ReferenceNumberCounter"
    WHERE "prefix" = 'SM'

    UNION ALL

    SELECT
        split_part(issue."referenceNumber", '-', 3)::INTEGER AS "year",
        split_part(issue."referenceNumber", '-', 4)::INTEGER AS "counter"
    FROM "WasteIssue" issue
    WHERE issue."referenceNumber" ~ '^SAL-MER-[0-9]{4}-[0-9]{6}$'
) source
GROUP BY source."year"
ON CONFLICT ("prefix", "year") DO UPDATE
SET "counter" = GREATEST("ReferenceNumberCounter"."counter", EXCLUDED."counter");

DELETE FROM "ReferenceNumberCounter" WHERE "prefix" = 'SM';
