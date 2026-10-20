-- Track the calendar year used by folio counters.
-- Year 0 is reserved for counters that are not yearly, such as supplier codes.
ALTER TABLE "ReferenceNumberCounter" ADD COLUMN "year" INTEGER NOT NULL DEFAULT 0;

UPDATE "ReferenceNumberCounter"
SET "year" = EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
WHERE "prefix" IN ('REC', 'SAL', 'REQ', 'AJU');

DROP INDEX "ReferenceNumberCounter_prefix_key";

CREATE UNIQUE INDEX "ReferenceNumberCounter_prefix_year_key"
ON "ReferenceNumberCounter"("prefix", "year");
