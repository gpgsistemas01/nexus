-- PostgreSQL considers NULL values distinct in a regular unique constraint. As
-- waste dimensions are optional, the schema constraint alone allowed multiple
-- dimensionless wastes for the same supplier material. The negative sentinel is
-- outside the valid (positive) dimension range enforced by the application.
CREATE UNIQUE INDEX "Waste_supplierMaterialId_dimensions_key"
ON "Waste" (
  "supplierMaterialId",
  COALESCE("base", -1::DECIMAL),
  COALESCE("height", -1::DECIMAL)
);
