-- Historical weights are unknown; never infer them from dimensions or stock.
ALTER TABLE "Waste" ADD COLUMN "weightKg" DECIMAL(18,6);
ALTER TABLE "Waste" ADD CONSTRAINT "Waste_weightKg_positive"
CHECK ("weightKg" IS NULL OR "weightKg" > 0);

-- The existing identity (supplierId, name, base, height) remains unique.
-- Presentation applicability is checked using the related Presentation by the service.
