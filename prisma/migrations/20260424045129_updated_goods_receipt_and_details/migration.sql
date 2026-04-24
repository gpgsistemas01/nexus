/*
  Warnings:

  - You are about to drop the column `amount` on the `GoodsReceiptDetail` table. All the data in the column will be lost.
  - You are about to drop the column `unitCost` on the `GoodsReceiptDetail` table. All the data in the column will be lost.
  - You are about to alter the column `quantity` on the `GoodsReceiptDetail` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Decimal(10,3)`.
  - Added the required column `totalGrossPurchaseAmount` to the `GoodsReceipt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalQuantity` to the `GoodsReceipt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalnetPurchaseAmount` to the `GoodsReceipt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `area` to the `GoodsReceiptDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `grossPurchaseAmount` to the `GoodsReceiptDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `netPurchaseAmount` to the `GoodsReceiptDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalArea` to the `GoodsReceiptDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitCostByArea` to the `GoodsReceiptDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitCostByQuantity` to the `GoodsReceiptDetail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GoodsReceipt" ADD COLUMN     "invoice" VARCHAR(50),
ADD COLUMN     "totalGrossPurchaseAmount" DECIMAL(10,3) NOT NULL,
ADD COLUMN     "totalQuantity" DECIMAL(10,3) NOT NULL,
ADD COLUMN     "totalnetPurchaseAmount" DECIMAL(10,3) NOT NULL;

-- AlterTable
ALTER TABLE "GoodsReceiptDetail" DROP COLUMN "amount",
DROP COLUMN "unitCost",
ADD COLUMN     "area" DECIMAL(12,3) NOT NULL,
ADD COLUMN     "grossPurchaseAmount" DECIMAL(10,3) NOT NULL,
ADD COLUMN     "netPurchaseAmount" DECIMAL(10,3) NOT NULL,
ADD COLUMN     "totalArea" DECIMAL(10,3) NOT NULL,
ADD COLUMN     "unitCostByArea" DECIMAL(10,3) NOT NULL,
ADD COLUMN     "unitCostByQuantity" DECIMAL(10,3) NOT NULL,
ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(10,3);
