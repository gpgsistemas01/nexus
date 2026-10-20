ALTER TABLE "Waste"
ADD COLUMN "sampleLengthM" DECIMAL(18,6),
ADD COLUMN "sampleNetWeightKg" DECIMAL(18,6);

ALTER TABLE "Waste" ADD CONSTRAINT "Waste_sample_reference_check" CHECK (
    ("sampleLengthM" IS NULL AND "sampleNetWeightKg" IS NULL)
    OR ("sampleLengthM" IS NOT NULL AND "sampleNetWeightKg" IS NOT NULL
        AND "sampleLengthM" > 0 AND "sampleNetWeightKg" > 0)
);
