/*
  Warnings:

  - You are about to drop the column `productId` on the `GoodsIssueDetail` table. All the data in the column will be lost.
  - You are about to drop the column `departmentId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `roleId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `_ProfileToUser` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `supplierProductId` to the `GoodsIssueDetail` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "GoodsIssueDetail" DROP CONSTRAINT "GoodsIssueDetail_productId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_roleId_fkey";

-- DropForeignKey
ALTER TABLE "_ProfileToUser" DROP CONSTRAINT "_ProfileToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProfileToUser" DROP CONSTRAINT "_ProfileToUser_B_fkey";

-- AlterTable
ALTER TABLE "GoodsIssueDetail" DROP COLUMN "productId",
ADD COLUMN     "supplierProductId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "departmentId",
DROP COLUMN "roleId",
ADD COLUMN     "profileId" UUID;

-- DropTable
DROP TABLE "_ProfileToUser";

-- CreateTable
CREATE TABLE "UserRoleDepartment" (
    "userId" UUID NOT NULL,
    "roleId" UUID NOT NULL,
    "departmentId" UUID NOT NULL,

    CONSTRAINT "UserRoleDepartment_pkey" PRIMARY KEY ("userId","roleId","departmentId")
);

-- CreateTable
CREATE TABLE "DepartmentProfile" (
    "departmentId" UUID NOT NULL,
    "profileId" UUID NOT NULL,

    CONSTRAINT "DepartmentProfile_pkey" PRIMARY KEY ("departmentId","profileId")
);

-- CreateTable
CREATE TABLE "Advisor" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "Advisor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "advisorId" UUID NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRoleDepartment" ADD CONSTRAINT "UserRoleDepartment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRoleDepartment" ADD CONSTRAINT "UserRoleDepartment_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRoleDepartment" ADD CONSTRAINT "UserRoleDepartment_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepartmentProfile" ADD CONSTRAINT "DepartmentProfile_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepartmentProfile" ADD CONSTRAINT "DepartmentProfile_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodsIssueDetail" ADD CONSTRAINT "GoodsIssueDetail_supplierProductId_fkey" FOREIGN KEY ("supplierProductId") REFERENCES "SupplierProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_advisorId_fkey" FOREIGN KEY ("advisorId") REFERENCES "Advisor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
