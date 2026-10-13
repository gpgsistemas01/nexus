BEGIN;

LOCK TABLE "Waste" IN ACCESS EXCLUSIVE MODE;

-- Review historical precision before PostgreSQL can round it during conversion.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM "Waste" WHERE "weightKg" <> ROUND("weightKg", 2)) THEN
        RAISE EXCEPTION 'No se puede reducir la precisión del peso de merma: existen pesos con más de dos decimales significativos. Revise esos registros antes de aplicar la migración.'
            USING ERRCODE = '23514';
    END IF;
END $$;

-- Five total digits: three integer digits and two decimal places.
ALTER TABLE "Waste" ALTER COLUMN "weightKg" TYPE DECIMAL(5,2);

COMMIT;
