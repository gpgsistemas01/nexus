/*
  Warnings:

  - You are about to drop the `Advisor` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `advisorId` to the `GoodsIssue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `advisorName` to the `GoodsIssue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientId` to the `GoodsIssue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientName` to the `GoodsIssue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departmentName` to the `GoodsIssue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectNumber` to the `GoodsIssue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requesterName` to the `GoodsIssue` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Client" DROP CONSTRAINT "Client_advisorId_fkey";

-- DropForeignKey
ALTER TABLE "GoodsIssue" DROP CONSTRAINT "GoodsIssue_projectId_fkey";

-- AlterTable
ALTER TABLE "Client" ALTER COLUMN "name" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "advisorId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "GoodsIssue" ADD COLUMN     "advisorId" UUID NOT NULL,
ADD COLUMN     "advisorName" VARCHAR(255) NOT NULL,
ADD COLUMN     "clientId" UUID NOT NULL,
ADD COLUMN     "clientName" VARCHAR(255) NOT NULL,
ADD COLUMN     "departmentName" VARCHAR(50) NOT NULL,
ADD COLUMN     "projectNumber" VARCHAR(10) NOT NULL,
ADD COLUMN     "requesterName" VARCHAR(255) NOT NULL,
ALTER COLUMN "projectId" DROP NOT NULL;

-- DropTable
DROP TABLE "Advisor";

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_advisorId_fkey" FOREIGN KEY ("advisorId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodsIssue" ADD CONSTRAINT "GoodsIssue_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodsIssue" ADD CONSTRAINT "GoodsIssue_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodsIssue" ADD CONSTRAINT "GoodsIssue_advisorId_fkey" FOREIGN KEY ("advisorId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
