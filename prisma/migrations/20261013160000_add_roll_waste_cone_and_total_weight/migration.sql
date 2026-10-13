BEGIN;

ALTER TABLE "Waste"
    ADD COLUMN "coneWeightKg" DECIMAL(5,2),
    ADD COLUMN "totalWeightKg" DECIMAL(5,2),
    ADD COLUMN "sourceMaterialId" UUID;

-- Existing net weights remain unchanged; historical cone/total weights are unknown.
ALTER TABLE "Waste" ADD CONSTRAINT "Waste_roll_weight_capture"
    CHECK (
        ("coneWeightKg" IS NULL AND "totalWeightKg" IS NULL)
        OR (
            "coneWeightKg" IS NOT NULL AND "totalWeightKg" IS NOT NULL
            AND "weightKg" IS NOT NULL
            AND "coneWeightKg" >= 0 AND "totalWeightKg" > "coneWeightKg"
            AND "totalWeightKg" <= 100
            AND "weightKg" = "totalWeightKg" - "coneWeightKg"
        )
    );

ALTER TABLE "SupplierMaterial"
    ADD COLUMN "referenceConeWeightKg" DECIMAL(5,2),
    ADD COLUMN "referenceRollTotalWeightKg" DECIMAL(5,2);
ALTER TABLE "SupplierMaterial" ADD CONSTRAINT "SupplierMaterial_roll_reference"
    CHECK (("referenceConeWeightKg" IS NULL OR "referenceConeWeightKg" BETWEEN 0 AND 100)
        AND ("referenceRollTotalWeightKg" IS NULL OR (
            "referenceConeWeightKg" IS NOT NULL
            AND "referenceRollTotalWeightKg" > "referenceConeWeightKg"
            AND "referenceRollTotalWeightKg" <= 100)));

ALTER TABLE "Waste" ADD CONSTRAINT "Waste_sourceMaterialId_fkey"
    FOREIGN KEY ("sourceMaterialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "Waste_sourceMaterialId_idx" ON "Waste"("sourceMaterialId");
DROP INDEX "Waste_supplierId_name_base_height_key";
CREATE UNIQUE INDEX "Waste_supplierId_name_base_height_coneWeightKg_totalWeightKg_key"
    ON "Waste"("supplierId", "name", "base", "height", "coneWeightKg", "totalWeightKg");
-- Preserve the uniqueness of historical records whose cone/total weights are unknown.
CREATE UNIQUE INDEX "Waste_unknown_weights_identity"
    ON "Waste"("supplierId", "name", "base", "height")
    WHERE "coneWeightKg" IS NULL AND "totalWeightKg" IS NULL;

COMMIT;
