-- Material dimensions are optional, so a regular composite unique constraint
-- would still permit duplicates whenever base and height are NULL. Material
-- names are compared case-insensitively to match application searches.
CREATE UNIQUE INDEX "Material_identity_key"
ON "Material" (
  LOWER("name"),
  "presentationId",
  "unitMeasureId",
  COALESCE("base", -1::DECIMAL),
  COALESCE("height", -1::DECIMAL)
);
