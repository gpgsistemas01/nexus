/*
  Warnings:

  - You are about to drop the column `base` on the `GoodsIssueDetail` table. All the data in the column will be lost.
  - You are about to drop the column `height` on the `GoodsIssueDetail` table. All the data in the column will be lost.
  - You are about to drop the column `unitCost` on the `GoodsIssueDetail` table. All the data in the column will be lost.
  - Added the required column `convertedQuantity` to the `GoodsIssueDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxUnitCost` to the `GoodsIssueDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `presentationName` to the `GoodsIssueDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productName` to the `GoodsIssueDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `supplierName` to the `GoodsIssueDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitMeasureName` to the `GoodsIssueDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitMeasureSymbol` to the `GoodsIssueDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `supplierName` to the `GoodsReceipt` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GoodsIssueDetail" DROP COLUMN "base",
DROP COLUMN "height",
DROP COLUMN "unitCost",
ADD COLUMN     "convertedQuantity" DECIMAL(10,3) NOT NULL,
ADD COLUMN     "maxUnitCost" DECIMAL(10,3) NOT NULL,
ADD COLUMN     "presentationName" VARCHAR(50) NOT NULL,
ADD COLUMN     "productBase" DECIMAL(10,3),
ADD COLUMN     "productHeight" DECIMAL(10,3),
ADD COLUMN     "productName" VARCHAR(200) NOT NULL,
ADD COLUMN     "supplierName" VARCHAR(200) NOT NULL,
ADD COLUMN     "unitMeasureName" VARCHAR(20) NOT NULL,
ADD COLUMN     "unitMeasureSymbol" VARCHAR(10) NOT NULL;

-- AlterTable
ALTER TABLE "GoodsReceipt" ADD COLUMN     "supplierName" VARCHAR(200) NOT NULL;
