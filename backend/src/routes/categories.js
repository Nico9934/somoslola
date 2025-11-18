import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, adminOnly } from "../middleware/auth.js";

const prisma = new PrismaClient();
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Gestión de categorías de productos
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Obtiene todas las categorías
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Lista de categorías
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 */
router.get("/", async (_, res) => {
    const categories = await prisma.category.findMany();
    res.json(categories);
});

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Crea una nueva categoría (solo admin)
 *     tags: [Categories]
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
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Categoría creada
 *       400:
 *         description: La categoría ya existe
 *       401:
 *         description: No autorizado
 */
router.post("/", authMiddleware, adminOnly, async (req, res) => {
    const { name } = req.body;
    const exists = await prisma.category.findUnique({ where: { name } });
    if (exists) return res.status(400).json({ error: "La categoría ya existe" });

    const category = await prisma.category.create({ data: { name } });
    res.json(category);
});

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Actualiza una categoría (solo admin)
 *     tags: [Categories]
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
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Categoría actualizada
 *       401:
 *         description: No autorizado
 */
router.put("/:id", authMiddleware, adminOnly, async (req, res) => {
    const id = Number(req.params.id);
    const { name } = req.body;

    const updated = await prisma.category.update({ where: { id }, data: { name } });
    res.json(updated);
});

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Elimina una categoría (solo admin)
 *     tags: [Categories]
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
 *         description: Categoría eliminada
 *       401:
 *         description: No autorizado
 */
router.delete("/:id", authMiddleware, adminOnly, async (req, res) => {
    const id = Number(req.params.id);
    await prisma.category.delete({ where: { id } });
    res.json({ message: "Categoría eliminada" });
});

export default router;
