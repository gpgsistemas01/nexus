BEGIN;

ALTER TABLE "Waste" DROP CONSTRAINT "Waste_roll_measurement_sources";
ALTER TABLE "Waste"
    DROP COLUMN "referenceConeWeightKg",
    DROP COLUMN "referenceConeWeightMode",
    DROP COLUMN "coneWeightSource",
    DROP COLUMN "referenceNetWeightKg",
    DROP COLUMN "referenceLengthM",
    DROP COLUMN "referenceWidthM";
-- Keep the source link, actual weights and calculated length of historical wastes.
ALTER TABLE "Waste" ADD CONSTRAINT "Waste_roll_measurement_sources"
    CHECK ("lengthSource" IN ('MEASURED', 'ESTIMATED')
        AND ("lengthSource" <> 'ESTIMATED' OR (
            "weightKg" IS NOT NULL
            AND "base" IS NOT NULL AND "base" > 0
            AND "height" IS NOT NULL AND "height" > 0)));

ALTER TABLE "SupplierMaterial" DROP CONSTRAINT "SupplierMaterial_roll_reference";
ALTER TABLE "SupplierMaterial"
    DROP COLUMN "coneWeightMode",
    DROP COLUMN "referenceRollNetWeightKg";
ALTER TABLE "SupplierMaterial" ADD CONSTRAINT "SupplierMaterial_roll_reference"
    CHECK (("referenceConeWeightKg" IS NULL OR "referenceConeWeightKg" BETWEEN 0 AND 100)
        AND ("referenceRollTotalWeightKg" IS NULL OR (
            "referenceConeWeightKg" IS NOT NULL
            AND "referenceRollTotalWeightKg" > "referenceConeWeightKg"
            AND "referenceRollTotalWeightKg" <= 100)));

COMMIT;
