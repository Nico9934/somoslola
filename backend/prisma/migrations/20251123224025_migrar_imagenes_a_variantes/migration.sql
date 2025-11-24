-- Migración: Copiar imágenes de productos a sus variantes
-- Para cada producto que tenga imágenes, copiarlas a todas sus variantes

-- Insertar una copia de cada imagen del producto en cada variante de ese producto
INSERT INTO "VariantImage" ("url", "variantId")
SELECT 
    pi.url,
    pv.id as "variantId"
FROM "ProductImage" pi
INNER JOIN "ProductVariant" pv ON pi."productId" = pv."productId"
WHERE NOT EXISTS (
    -- Evitar duplicados si ya existen imágenes de variante
    SELECT 1 FROM "VariantImage" vi 
    WHERE vi."variantId" = pv.id AND vi.url = pi.url
);

-- Log del proceso (esto se muestra en la consola de Prisma)
-- Las imágenes de productos ahora están copiadas a todas las variantes de cada producto