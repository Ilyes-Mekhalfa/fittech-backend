/*
  Warnings:

  - A unique constraint covering the columns `[annexId]` on the table `Annex` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Annex_annexId_key" ON "Annex"("annexId");
