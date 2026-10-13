BEGIN;

ALTER TABLE "SupplierMaterial"
    ADD COLUMN "coneWeightMode" VARCHAR(8) NOT NULL DEFAULT 'VARIABLE',
    ADD COLUMN "referenceConeWeightKg" DECIMAL(5,2),
    ADD COLUMN "referenceRollTotalWeightKg" DECIMAL(5,2),
    ADD COLUMN "referenceRollNetWeightKg" DECIMAL(5,2);

ALTER TABLE "SupplierMaterial" ADD CONSTRAINT "SupplierMaterial_roll_reference"
    CHECK (
        "coneWeightMode" IN ('FIXED', 'VARIABLE')
        AND ("coneWeightMode" <> 'FIXED' OR "referenceConeWeightKg" IS NOT NULL)
        AND ("referenceConeWeightKg" IS NULL OR "referenceConeWeightKg" BETWEEN 0 AND 100)
        AND (
            ("referenceRollTotalWeightKg" IS NULL AND "referenceRollNetWeightKg" IS NULL)
            OR ("referenceConeWeightKg" IS NOT NULL AND "referenceRollTotalWeightKg" IS NOT NULL
                AND "referenceRollNetWeightKg" IS NOT NULL
                AND "referenceRollTotalWeightKg" > "referenceConeWeightKg"
                AND "referenceRollTotalWeightKg" <= 100
                AND "referenceRollNetWeightKg" = "referenceRollTotalWeightKg" - "referenceConeWeightKg")
        )
    );

ALTER TABLE "Waste"
    ADD COLUMN "sourceMaterialId" UUID,
    ADD COLUMN "referenceConeWeightKg" DECIMAL(5,2),
    ADD COLUMN "referenceConeWeightMode" VARCHAR(8),
    ADD COLUMN "coneWeightSource" VARCHAR(24),
    ADD COLUMN "lengthSource" VARCHAR(9) NOT NULL DEFAULT 'MEASURED',
    ADD COLUMN "referenceNetWeightKg" DECIMAL(5,2),
    ADD COLUMN "referenceLengthM" DECIMAL(18,6),
    ADD COLUMN "referenceWidthM" DECIMAL(18,6);

ALTER TABLE "Waste" ADD CONSTRAINT "Waste_sourceMaterialId_fkey"
    FOREIGN KEY ("sourceMaterialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "Waste_sourceMaterialId_idx" ON "Waste"("sourceMaterialId");

ALTER TABLE "Waste" ADD CONSTRAINT "Waste_roll_measurement_sources"
    CHECK (
        "lengthSource" IN ('MEASURED', 'ESTIMATED')
        AND ("referenceConeWeightMode" IS NULL OR "referenceConeWeightMode" IN ('FIXED', 'VARIABLE'))
        AND ("coneWeightSource" IS NULL OR "coneWeightSource" IN ('MEASURED', 'FIXED_REFERENCE', 'ESTIMATED_REFERENCE'))
        AND ("coneWeightSource" IS NULL OR ("coneWeightKg" IS NOT NULL AND "totalWeightKg" IS NOT NULL))
        AND ("lengthSource" <> 'ESTIMATED' OR (
            "weightKg" IS NOT NULL AND "referenceNetWeightKg" > 0
            AND "referenceLengthM" > 0 AND "referenceWidthM" > 0
            AND "base" > 0 AND "height" > 0
            AND "referenceNetWeightKg" IS NOT NULL AND "referenceLengthM" IS NOT NULL AND "referenceWidthM" IS NOT NULL))
        AND ("coneWeightSource" NOT IN ('FIXED_REFERENCE', 'ESTIMATED_REFERENCE') OR (
            "referenceConeWeightKg" IS NOT NULL AND "coneWeightKg" = "referenceConeWeightKg"))
    );

DROP INDEX "Waste_supplierId_name_base_height_key";
CREATE UNIQUE INDEX "Waste_supplierId_name_base_height_coneWeightKg_totalWeightKg_key"
    ON "Waste"("supplierId", "name", "base", "height", "coneWeightKg", "totalWeightKg");
-- Retain the previous identity for historical records with unknown cone/total weights.
CREATE UNIQUE INDEX "Waste_unknown_weights_identity"
    ON "Waste"("supplierId", "name", "base", "height")
    WHERE "coneWeightKg" IS NULL AND "totalWeightKg" IS NULL;

COMMIT;
