BEGIN;

ALTER TABLE "Waste"
    ADD COLUMN "coneWeightKg" DECIMAL(5,2),
    ADD COLUMN "totalWeightKg" DECIMAL(5,2);

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

COMMIT;
