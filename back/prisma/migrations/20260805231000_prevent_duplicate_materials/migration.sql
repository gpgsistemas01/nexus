-- Material dimensions are optional, so a regular composite unique constraint
-- would still permit duplicates whenever base and height are NULL. Material
-- names are compared case-insensitively to match application searches.
--
-- Keep the lowest UUID as the canonical row when legacy data already contains
-- the same identity. Renaming (rather than deleting or merging) preserves every
-- inventory relationship and makes the duplicate visible for manual review.
-- The UUID suffix also makes the renamed value deterministic and unique while
-- staying within Material.name's VARCHAR(200) limit.
WITH ranked_materials AS (
  SELECT
    "id",
    "name",
    ROW_NUMBER() OVER (
      PARTITION BY
        LOWER("name"),
        "presentationId",
        "unitMeasureId",
        COALESCE("base", -1::DECIMAL),
        COALESCE("height", -1::DECIMAL)
      ORDER BY "id"
    ) AS duplicate_number
  FROM "Material"
)
UPDATE "Material" AS material
SET "name" = LEFT(ranked."name", 151) || ' [duplicado:' || material."id"::TEXT || ']'
FROM ranked_materials AS ranked
WHERE ranked."id" = material."id"
  AND ranked.duplicate_number > 1;

CREATE UNIQUE INDEX "Material_identity_key"
ON "Material" (
  LOWER("name"),
  "presentationId",
  "unitMeasureId",
  COALESCE("base", -1::DECIMAL),
  COALESCE("height", -1::DECIMAL)
);
