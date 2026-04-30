/*
  Warnings:

  - You are about to drop the column `unitCost` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "unitCost",
ADD COLUMN     "maxUnitCost" DECIMAL(10,3);
