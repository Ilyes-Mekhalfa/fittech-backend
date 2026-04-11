/*
  Warnings:

  - You are about to drop the `Annex` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ROLE" AS ENUM ('ADMIN', 'COACH', 'MEMBER', 'MANAGER');

-- DropTable
DROP TABLE "Annex";

-- CreateTable
CREATE TABLE "AnnexManager" (
    "id" SERIAL NOT NULL,
    "annexName" TEXT NOT NULL DEFAULT 'annex',
    "annexCode" TEXT NOT NULL,
    "role" "ROLE" NOT NULL DEFAULT 'MANAGER',
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,

    CONSTRAINT "AnnexManager_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AnnexManager_annexCode_key" ON "AnnexManager"("annexCode");

-- CreateIndex
CREATE UNIQUE INDEX "AnnexManager_email_key" ON "AnnexManager"("email");
