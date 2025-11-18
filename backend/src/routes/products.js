import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, adminOnly } from "../middleware/auth.js";

const prisma = new PrismaClient();
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Gestión de productos y sus variantes
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Obtiene todos los productos con variantes y categoría
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Lista de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get("/", async (_, res) => {
    const products = await prisma.product.findMany({
        include: { variants: true, category: true },
    });
    res.json(products);
});

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Obtiene un producto por su ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto encontrado
 *       404:
 *         description: Producto no encontrado
 */
router.get("/:id", async (req, res) => {
    const id = Number(req.params.id);

    const product = await prisma.product.findUnique({
        where: { id },
        include: { variants: true, category: true },
    });

    if (!product)
        return res.status(404).json({ error: "Producto no encontrado" });

    res.json(product);
});

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Crea un nuevo producto con variantes (solo admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - basePrice
 *               - categoryId
 *               - variants
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               basePrice:
 *                 type: number
 *               categoryId:
 *                 type: integer
 *               variants:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [sku, stock]
 *                   properties:
 *                     sku:
 *                       type: string
 *                     stock:
 *                       type: integer
 *                     cost:
 *                       type: number
 *                       nullable: true
 *     responses:
 *       200:
 *         description: Producto creado correctamente
 *       400:
 *         description: Debe incluir al menos una variante
 *       401:
 *         description: No autorizado / token faltante
 */
router.post("/", authMiddleware, adminOnly, async (req, res) => {
    const { name, description, basePrice, categoryId, variants } = req.body;

    if (!variants || !Array.isArray(variants) || variants.length === 0) {
        return res
            .status(400)
            .json({ error: "Debes agregar al menos una variante" });
    }

    const product = await prisma.product.create({
        data: {
            name,
            description,
            basePrice: Number(basePrice),
            categoryId: Number(categoryId),
            variants: {
                create: variants.map((v) => ({
                    sku: v.sku,
                    stock: v.stock ?? 0,
                    cost: v.cost ?? null,
                })),
            },
        },
        include: { variants: true },
    });

    res.json(product);
});

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Actualiza un producto (solo admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Producto actualizado
 *       401:
 *         description: No autorizado
 */
router.put("/:id", authMiddleware, adminOnly, async (req, res) => {
    const id = Number(req.params.id);
    const data = req.body;

    const product = await prisma.product.update({
        where: { id },
        data,
    });

    res.json(product);
});

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Elimina un producto (solo admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto eliminado
 *       401:
 *         description: No autorizado
 */
router.delete("/:id", authMiddleware, adminOnly, async (req, res) => {
    const id = Number(req.params.id);

    await prisma.product.delete({
        where: { id },
    });

    res.json({ message: "Producto eliminado" });
});

export default router;
