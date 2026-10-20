ALTER TABLE "Waste" ADD COLUMN "referenceRollTotalWeightKg" DECIMAL(5,2);

-- La referencia nueva usa el mismo cono; las muestras e históricos anteriores no cambian.
ALTER TABLE "Waste" ADD CONSTRAINT "Waste_full_roll_reference_check" CHECK (
    "referenceRollTotalWeightKg" IS NULL
    OR (
        "coneWeightKg" IS NOT NULL AND "totalWeightKg" IS NOT NULL
        AND "sampleLengthM" IS NOT NULL AND "sampleNetWeightKg" IS NOT NULL
        AND "referenceRollTotalWeightKg" > "coneWeightKg"
        AND "referenceRollTotalWeightKg" <= 999.99
        AND "sampleNetWeightKg" = "referenceRollTotalWeightKg" - "coneWeightKg"
    )
);
