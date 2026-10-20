BEGIN;

-- Conserva las referencias históricas; las altas nuevas calculan largo y neto sin guardarlos.
ALTER TABLE "Waste" DROP CONSTRAINT "Waste_full_roll_reference_check";
ALTER TABLE "Waste" ADD CONSTRAINT "Waste_full_roll_reference_check" CHECK (
    "referenceRollTotalWeightKg" IS NULL
    OR (
        "coneWeightKg" IS NOT NULL AND "totalWeightKg" IS NOT NULL
        AND "referenceRollTotalWeightKg" > "coneWeightKg"
        AND "referenceRollTotalWeightKg" <= 999.99
        AND ("sampleNetWeightKg" IS NULL
            OR "sampleNetWeightKg" = "referenceRollTotalWeightKg" - "coneWeightKg")
    )
);

COMMIT;
