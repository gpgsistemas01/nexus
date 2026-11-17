INSERT INTO "Presentation" ("name") VALUES ('KILOGRAMOS'), ('METRO LINEAL')
ON CONFLICT ("name") DO NOTHING;

-- Conserva las referencias históricas y retira estas opciones de nuevas capturas.
UPDATE "Presentation" SET "isActive" = false
WHERE upper(trim("name")) IN ('CAJA', 'KILO') AND "isActive" = true;
