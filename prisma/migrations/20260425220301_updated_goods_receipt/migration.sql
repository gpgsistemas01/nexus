/*
  Warnings:

  - You are about to drop the column `approveDate` on the `GoodsReceipt` table. All the data in the column will be lost.
  - You are about to drop the column `approverId` on the `GoodsReceipt` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "GoodsReceipt" DROP CONSTRAINT "GoodsReceipt_approverId_fkey";

-- AlterTable
ALTER TABLE "GoodsReceipt" DROP COLUMN "approveDate",
DROP COLUMN "approverId";
