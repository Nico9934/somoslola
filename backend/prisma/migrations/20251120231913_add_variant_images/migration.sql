-- DropForeignKey
ALTER TABLE "ProductImage" DROP CONSTRAINT "ProductImage_productId_fkey";

-- CreateTable
CREATE TABLE "VariantImage" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "variantId" INTEGER NOT NULL,

    CONSTRAINT "VariantImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VariantImage_variantId_idx" ON "VariantImage"("variantId");

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariantImage" ADD CONSTRAINT "VariantImage_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
