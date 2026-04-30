/*
  Warnings:

  - You are about to drop the column `supplierProductId` on the `GoodsIssueDetail` table. All the data in the column will be lost.
  - Added the required column `presentationId` to the `GoodsIssueDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `GoodsIssueDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `supplierId` to the `GoodsIssueDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitCost` to the `GoodsIssueDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitMeasureId` to the `GoodsIssueDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `presentationId` to the `GoodsReceiptDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitMeasureId` to the `GoodsReceiptDetail` table without a default value. This is not possible if the table is not empty.
  - Made the column `unitCostByArea` on table `GoodsReceiptDetail` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "GoodsIssueDetail" DROP CONSTRAINT "GoodsIssueDetail_supplierProductId_fkey";

-- AlterTable
ALTER TABLE "GoodsIssueDetail" DROP COLUMN "supplierProductId",
ADD COLUMN     "base" DECIMAL(10,3),
ADD COLUMN     "difference" DECIMAL(10,3),
ADD COLUMN     "height" DECIMAL(10,3),
ADD COLUMN     "presentationId" UUID NOT NULL,
ADD COLUMN     "productId" UUID NOT NULL,
ADD COLUMN     "projectQuantity" DECIMAL(10,2),
ADD COLUMN     "supplierId" UUID NOT NULL,
ADD COLUMN     "unitCost" DECIMAL(10,3) NOT NULL,
ADD COLUMN     "unitMeasureId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "GoodsReceiptDetail" ADD COLUMN     "base" DECIMAL(10,3),
ADD COLUMN     "height" DECIMAL(10,3),
ADD COLUMN     "presentationId" UUID NOT NULL,
ADD COLUMN     "unitMeasureId" UUID NOT NULL,
ALTER COLUMN "unitCostByArea" SET NOT NULL;
