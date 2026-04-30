/*
  Warnings:

  - You are about to drop the column `base` on the `GoodsReceiptDetail` table. All the data in the column will be lost.
  - You are about to drop the column `height` on the `GoodsReceiptDetail` table. All the data in the column will be lost.
  - You are about to drop the column `totalArea` on the `GoodsReceiptDetail` table. All the data in the column will be lost.
  - You are about to drop the column `unitCostByArea` on the `GoodsReceiptDetail` table. All the data in the column will be lost.
  - You are about to drop the column `unitCostByQuantity` on the `GoodsReceiptDetail` table. All the data in the column will be lost.
  - Added the required column `conversionUnitCost` to the `GoodsReceiptDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `convertedQuantity` to the `GoodsReceiptDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `costPerUnitType` to the `GoodsReceiptDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `presentationName` to the `GoodsReceiptDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productName` to the `GoodsReceiptDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitMeasureName` to the `GoodsReceiptDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitMeasureSymbol` to the `GoodsReceiptDetail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GoodsReceiptDetail" DROP COLUMN "base",
DROP COLUMN "height",
DROP COLUMN "totalArea",
DROP COLUMN "unitCostByArea",
DROP COLUMN "unitCostByQuantity",
ADD COLUMN     "conversionUnitCost" DECIMAL(10,3) NOT NULL,
ADD COLUMN     "convertedQuantity" DECIMAL(10,3) NOT NULL,
ADD COLUMN     "costPerUnitType" DECIMAL(10,3) NOT NULL,
ADD COLUMN     "presentationName" VARCHAR(50) NOT NULL,
ADD COLUMN     "productBase" DECIMAL(10,3),
ADD COLUMN     "productHeight" DECIMAL(10,3),
ADD COLUMN     "productName" VARCHAR(200) NOT NULL,
ADD COLUMN     "unitMeasureName" VARCHAR(20) NOT NULL,
ADD COLUMN     "unitMeasureSymbol" VARCHAR(10) NOT NULL;
