-- CreateTable
CREATE TABLE "Waste" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "supplierProductId" UUID NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "minStock" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "base" DECIMAL(10,2) NOT NULL,
    "height" DECIMAL(10,2) NOT NULL,
    "currentStock" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "convertedQuantity" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Waste_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Waste_supplierProductId_idx" ON "Waste"("supplierProductId");

-- CreateIndex
CREATE UNIQUE INDEX "Waste_supplierProductId_base_height_key" ON "Waste"("supplierProductId", "base", "height");

-- AddForeignKey
ALTER TABLE "Waste" ADD CONSTRAINT "Waste_supplierProductId_fkey" FOREIGN KEY ("supplierProductId") REFERENCES "SupplierProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
