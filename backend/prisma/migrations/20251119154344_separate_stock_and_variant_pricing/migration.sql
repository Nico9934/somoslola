/*
  Warnings:

  - You are about to drop the column `basePrice` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `ProductVariant` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `ProductVariant` table. All the data in the column will be lost.
  - Added the required column `salePrice` to the `ProductVariant` table without a default value. This is not possible if the table is not empty.

*/

-- Paso 1: Agregar columna salePrice con valor temporal
ALTER TABLE "ProductVariant" ADD COLUMN "salePrice" DOUBLE PRECISION;

-- Paso 2: Migrar basePrice del producto a salePrice de cada variante
-- Si la variante tenía price, usar ese; sino usar basePrice del producto
UPDATE "ProductVariant" 
SET "salePrice" = COALESCE("ProductVariant"."price", "Product"."basePrice")
FROM "Product"
WHERE "ProductVariant"."productId" = "Product"."id";

-- Paso 3: Hacer salePrice NOT NULL ahora que tiene valores
ALTER TABLE "ProductVariant" ALTER COLUMN "salePrice" SET NOT NULL;

-- Paso 4: Agregar columna promotionPrice
ALTER TABLE "ProductVariant" ADD COLUMN "promotionPrice" DOUBLE PRECISION;

-- Paso 5: Crear tabla Stock y migrar stock de variantes
CREATE TABLE "Stock" (
    "id" SERIAL NOT NULL,
    "variantId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "reservedQty" INTEGER NOT NULL DEFAULT 0,
    "lowStockAlert" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("id")
);

-- Paso 6: Migrar stock de ProductVariant a tabla Stock
INSERT INTO "Stock" ("variantId", "quantity", "createdAt", "updatedAt")
SELECT "id", COALESCE("stock", 0), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "ProductVariant";

-- Paso 7: Crear índices y constraints
CREATE UNIQUE INDEX "Stock_variantId_key" ON "Stock"("variantId");
CREATE INDEX "Stock_variantId_idx" ON "Stock"("variantId");

-- Paso 8: Eliminar columnas viejas
ALTER TABLE "ProductVariant" DROP COLUMN "price";
ALTER TABLE "ProductVariant" DROP COLUMN "stock";
ALTER TABLE "Product" DROP COLUMN "basePrice";

-- Paso 9: Reconfigurar foreign keys con CASCADE
ALTER TABLE "ProductVariant" DROP CONSTRAINT "ProductVariant_productId_fkey";
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" 
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Paso 10: Agregar foreign key de Stock
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_variantId_fkey" 
    FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

