CREATE TYPE "GoodsReceiptDetailStatus" AS ENUM ('ACTIVE', 'CANCELED');

ALTER TABLE "GoodsReceiptDetail"
ADD COLUMN "status" "GoodsReceiptDetailStatus" NOT NULL DEFAULT 'ACTIVE';
