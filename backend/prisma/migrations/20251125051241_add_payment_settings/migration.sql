-- CreateTable
CREATE TABLE "PaymentSettings" (
    "id" SERIAL NOT NULL,
    "transferDiscount" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "installmentsCount" INTEGER NOT NULL DEFAULT 3,
    "installmentsActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentSettings_pkey" PRIMARY KEY ("id")
);
