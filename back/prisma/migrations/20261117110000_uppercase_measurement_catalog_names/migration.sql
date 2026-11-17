-- Evita fusionar identidades que puedan tener referencias distintas.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM "Presentation" GROUP BY upper(trim("name")) HAVING count(*) > 1)
        OR EXISTS (SELECT 1 FROM "UnitMeasure" GROUP BY upper(trim("name")), "symbol" HAVING count(*) > 1) THEN
        RAISE EXCEPTION 'Hay nombres de catálogo duplicados al convertir a mayúsculas. Revise sus referencias antes de migrar.';
    END IF;
END $$;
UPDATE "Presentation" SET "name" = upper(trim("name")) WHERE "name" <> upper(trim("name"));
UPDATE "UnitMeasure" SET "name" = upper(trim("name")) WHERE "name" <> upper(trim("name"));
