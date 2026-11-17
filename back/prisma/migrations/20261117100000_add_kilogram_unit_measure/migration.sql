INSERT INTO "UnitMeasure" ("name", "symbol")
VALUES ('Kilogramo', 'kg')
ON CONFLICT ("name", "symbol") DO NOTHING;

INSERT INTO "Presentation" ("name")
VALUES ('Caja')
ON CONFLICT ("name") DO NOTHING;
