-- Waste adjustments use their own folio family instead of sharing AJU with
-- material adjustments. Seed each yearly counter from existing AJU-MER folios
-- produced by the original waste-adjustment backfill.
INSERT INTO "ReferenceNumberCounter" ("id", "prefix", "year", "counter")
SELECT
    gen_random_uuid(),
    'AJU-MER',
    parsed."year",
    MAX(parsed."counter")
FROM (
    SELECT
        (matches.parts)[1]::INTEGER AS "year",
        (matches.parts)[2]::INTEGER AS "counter"
    FROM "WasteStockAdjustment" adjustment
    CROSS JOIN LATERAL regexp_match(
        adjustment."referenceNumber",
        '^AJU-MER-([0-9]{4})-([0-9]{6})$'
    ) AS matches(parts)
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

INSERT INTO "ReferenceNumberCounter" ("id", "prefix", "year", "counter")
SELECT gen_random_uuid(), 'SAL-MER', source."year", MAX(source."counter")
FROM (
    SELECT "year", "counter"
    FROM "ReferenceNumberCounter"
    WHERE "prefix" = 'SM'

    UNION ALL

    SELECT
        (matches.parts)[1]::INTEGER AS "year",
        (matches.parts)[2]::INTEGER AS "counter"
    FROM "WasteIssue" issue
    CROSS JOIN LATERAL regexp_match(
        issue."referenceNumber",
        '^SAL-MER-([0-9]{4})-([0-9]{6})$'
    ) AS matches(parts)
) source
GROUP BY source."year"
ON CONFLICT ("prefix", "year") DO UPDATE
SET "counter" = GREATEST("ReferenceNumberCounter"."counter", EXCLUDED."counter");

DELETE FROM "ReferenceNumberCounter" WHERE "prefix" = 'SM';
