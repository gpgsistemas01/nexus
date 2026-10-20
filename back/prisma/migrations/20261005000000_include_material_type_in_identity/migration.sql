DROP INDEX "Material_identity_key";

CREATE UNIQUE INDEX "Material_identity_key"
ON "Material" (
  LOWER("name"),
  "presentationId",
  "unitMeasureId",
  COALESCE("base", -1::DECIMAL),
  COALESCE("height", -1::DECIMAL),
  "type"
);
