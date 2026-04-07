-- CreateTable
CREATE TABLE "Annex" (
    "id" SERIAL NOT NULL,
    "annexName" TEXT NOT NULL,
    "annexId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Annex_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Annex_annexName_key" ON "Annex"("annexName");
