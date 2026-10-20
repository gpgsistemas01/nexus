BEGIN;

LOCK TABLE "Waste" IN ACCESS EXCLUSIVE MODE;

-- Preserve legacy data: an out-of-range weight requires review, never clamping.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM "Waste" WHERE "weightKg" > 100) THEN
        RAISE EXCEPTION 'No se puede limitar el peso de merma: existen pesos mayores que 100 kg. Revise esos registros antes de aplicar la migración.'
            USING ERRCODE = '23514';
    END IF;
END $$;

-- Three integer digits allow exactly 100 kg; preserve the six recorded decimals.
ALTER TABLE "Waste" ALTER COLUMN "weightKg" TYPE DECIMAL(9,6);
ALTER TABLE "Waste" ADD CONSTRAINT "Waste_weightKg_maximum"
    CHECK ("weightKg" IS NULL OR "weightKg" <= 100);

COMMIT;
