/*
  Warnings:

  - Added the required column `receivedByName` to the `GoodsReceipt` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GoodsReceipt" ADD COLUMN     "receivedByName" VARCHAR(255) NOT NULL;
