-- CreateEnum
CREATE TYPE "AttributeType" AS ENUM ('SELECT', 'NUMBER', 'TEXT');

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "price" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Attribute" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "AttributeType" NOT NULL DEFAULT 'SELECT',
    "unit" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttributeValue" (
    "id" SERIAL NOT NULL,
    "attributeId" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    "hexColor" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttributeValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductAttribute" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "attributeId" INTEGER NOT NULL,

    CONSTRAINT "ProductAttribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VariantAttributeValue" (
    "id" SERIAL NOT NULL,
    "variantId" INTEGER NOT NULL,
    "attributeId" INTEGER NOT NULL,
    "attributeValueId" INTEGER NOT NULL,

    CONSTRAINT "VariantAttributeValue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Attribute_name_key" ON "Attribute"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Attribute_slug_key" ON "Attribute"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "AttributeValue_attributeId_value_key" ON "AttributeValue"("attributeId", "value");

-- CreateIndex
CREATE UNIQUE INDEX "ProductAttribute_productId_attributeId_key" ON "ProductAttribute"("productId", "attributeId");

-- CreateIndex
CREATE UNIQUE INDEX "VariantAttributeValue_variantId_attributeId_key" ON "VariantAttributeValue"("variantId", "attributeId");

-- AddForeignKey
ALTER TABLE "AttributeValue" ADD CONSTRAINT "AttributeValue_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "Attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAttribute" ADD CONSTRAINT "ProductAttribute_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAttribute" ADD CONSTRAINT "ProductAttribute_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "Attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariantAttributeValue" ADD CONSTRAINT "VariantAttributeValue_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariantAttributeValue" ADD CONSTRAINT "VariantAttributeValue_attributeValueId_fkey" FOREIGN KEY ("attributeValueId") REFERENCES "AttributeValue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
