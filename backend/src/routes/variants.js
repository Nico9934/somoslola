import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, adminOnly } from "../middleware/auth.js";

const prisma = new PrismaClient();
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Variants
 *   description: Gestión de variantes de productos
 */

/* -------------------------------------------------------
   📦 GET /variants - Listar todas las variantes
------------------------------------------------------- */
/**
 * @swagger
 * /variants:
 *   get:
 *     summary: Lista todas las variantes
 *     tags: [Variants]
 *     responses:
 *       200:
 *         description: Lista de variantes
 */
router.get("/", async (_, res) => {
    const variants = await prisma.productVariant.findMany({
        include: { product: { select: { id: true, name: true } } }
    });
    res.json(variants);
});

/* -------------------------------------------------------
   🔎 GET /variants/find/sku/{sku} - Buscar por SKU
------------------------------------------------------- */
/**
 * @swagger
 * /variants/find/sku/{sku}:
 *   get:
 *     summary: Obtiene una variante por su SKU
 *     tags: [Variants]
 *     parameters:
 *       - in: path
 *         name: sku
 *         required: true
 *         schema:
 *           type: string
 *         description: SKU de la variante
 *     responses:
 *       200:
 *         description: Variante encontrada
 *       404:
 *         description: Variante no encontrada
 */
router.get("/find/sku/:sku", async (req, res) => {
    const { sku } = req.params;
    const variant = await prisma.productVariant.findUnique({
        where: { sku },
        include: { product: { select: { id: true, name: true } } }
    });

    if (!variant) return res.status(404).json({ error: "Variante no encontrada" });
    res.json(variant);
});

/* -------------------------------------------------------
   🔎 GET /variants/{id} - Buscar por ID
------------------------------------------------------- */
/**
 * @swagger
 * /variants/{id}:
 *   get:
 *     summary: Obtiene una variante por ID
 *     tags: [Variants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la variante
 *     responses:
 *       200:
 *         description: Variante encontrada
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Variante no encontrada
 */
router.get("/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0)
        return res.status(400).json({ error: "ID inválido" });

    const variant = await prisma.productVariant.findUnique({
        where: { id },
        include: { product: { select: { id: true, name: true } } }
    });

    if (!variant) return res.status(404).json({ error: "Variante no encontrada" });
    res.json(variant);
});

/* -------------------------------------------------------
   ➕ POST /products/{id}/variants - Crear variante
------------------------------------------------------- */
/**
 * @swagger
 * /variants/products/{id}/variants:
 *   post:
 *     summary: Crea una variante para un producto (solo admin)
 *     tags: [Variants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sku
 *             properties:
 *               sku:
 *                 type: string
 *               stock:
 *                 type: integer
 *                 default: 0
 *               cost:
 *                 type: number
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Variante creada
 *       400:
 *         description: El SKU ya existe
 */
router.post("/products/:id/variants", authMiddleware, adminOnly, async (req, res) => {
    const productId = Number(req.params.id);
    const { sku, stock = 0, cost = null } = req.body;

    const exists = await prisma.productVariant.findUnique({ where: { sku } });
    if (exists) return res.status(400).json({ error: "El SKU ya existe" });

    const variant = await prisma.productVariant.create({
        data: { sku, stock, cost, productId }
    });

    res.json(variant);
});

/* -------------------------------------------------------
   ✏ PUT /products/{id}/variants/{variantId} - Editar variante
------------------------------------------------------- */
/**
 * @swagger
 * /variants/products/{id}/variants/{variantId}:
 *   put:
 *     summary: Actualiza una variante (solo admin)
 *     tags: [Variants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: integer }
 *         required: true
 *       - in: path
 *         name: variantId
 *         schema: { type: integer }
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sku:
 *                 type: string
 *               stock:
 *                 type: integer
 *               cost:
 *                 type: number
 *     responses:
 *       200: { description: Variante actualizada }
 */
router.put("/products/:id/variants/:variantId", authMiddleware, adminOnly, async (req, res) => {
    const variantId = Number(req.params.variantId);
    const { sku, salePrice, promotionPrice, cost, images } = req.body;

    console.log(`✏️ Actualizando variante ${variantId}`, { sku, salePrice, promotionPrice, cost, imagesCount: images?.length });

    // Debug: ver todas las imágenes recibidas
    if (images && images.length > 0) {
        console.log('  📸 Imágenes recibidas:');
        images.forEach((img, i) => {
            console.log(`    ${i + 1}. url=${img.url?.substring(0, 60)}...`);
        });
    }

    const updateData = {};
    if (sku !== undefined) updateData.sku = sku;
    if (salePrice !== undefined) updateData.salePrice = Number(salePrice);
    if (promotionPrice !== undefined) updateData.promotionPrice = promotionPrice ? Number(promotionPrice) : null;
    if (cost !== undefined) updateData.cost = cost ? Number(cost) : null;

    // Manejar imágenes: eliminar las existentes y crear las nuevas
    if (images !== undefined) {
        console.log('  🖼️ Actualizando imágenes de la variante...');
        // Eliminar imágenes existentes
        await prisma.variantImage.deleteMany({
            where: { variantId }
        });
        console.log('    ✅ Imágenes existentes eliminadas');

        // Crear nuevas imágenes
        if (images.length > 0) {
            updateData.images = {
                create: images.map(img => ({ url: img.url }))
            };
            console.log(`    ✅ Creando ${images.length} nuevas imágenes...`);
            console.log('    📋 Array a crear:', images.map(img => ({ url: img.url })));
        }
    }

    const updated = await prisma.productVariant.update({
        where: { id: variantId },
        data: updateData,
        include: {
            images: true,
            stock: true,
            attributeValues: {
                include: {
                    attributeValue: {
                        include: {
                            attribute: true
                        }
                    }
                }
            }
        }
    });

    console.log('✅ Variante actualizada:', updated.sku);
    res.json(updated);
});

/* -------------------------------------------------------
   🗑 DELETE /products/{id}/variants/{variantId} - Eliminar variante
------------------------------------------------------- */
/**
 * @swagger
 * /variants/products/{id}/variants/{variantId}:
 *   delete:
 *     summary: Elimina una variante (solo admin)
 *     tags: [Variants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         schema: { type: integer }
 *         required: true
 *       - name: variantId
 *         in: path
 *         schema: { type: integer }
 *         required: true
 *     responses:
 *       200:
 *         description: Variante eliminada
 */
router.delete("/products/:id/variants/:variantId", authMiddleware, adminOnly, async (req, res) => {
    const variantId = Number(req.params.variantId);
    await prisma.productVariant.delete({ where: { id: variantId } });
    res.json({ message: "Variante eliminada" });
});

export default router;
