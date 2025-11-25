import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";

const prisma = new PrismaClient();
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Brands
 *   description: Gestión de marcas
 */

/**
 * @swagger
 * /brands:
 *   get:
 *     summary: Lista todas las marcas
 *     tags: [Brands]
 */
router.get("/", async (req, res) => {
    try {
        const brands = await prisma.brand.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });
        res.json(brands);
    } catch (error) {
        console.error("❌ Error al obtener marcas:", error);
        res.status(500).json({ error: "Error al obtener marcas" });
    }
});

/**
 * @swagger
 * /brands/{id}:
 *   get:
 *     summary: Obtiene una marca por ID
 *     tags: [Brands]
 */
router.get("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const brand = await prisma.brand.findUnique({
            where: { id },
            include: {
                products: true
            }
        });

        if (!brand) {
            return res.status(404).json({ error: "Marca no encontrada" });
        }

        res.json(brand);
    } catch (error) {
        console.error("❌ Error al obtener marca:", error);
        res.status(500).json({ error: "Error al obtener marca" });
    }
});

/**
 * @swagger
 * /brands:
 *   post:
 *     summary: Crea una nueva marca (admin)
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 */
router.post("/", authMiddleware, async (req, res) => {
    if (req.user.role !== "ADMIN") {
        return res.status(403).json({ error: "No autorizado" });
    }

    try {
        const { name, logo } = req.body;

        if (!name) {
            return res.status(400).json({ error: "El nombre es requerido" });
        }

        // Generar slug automáticamente
        const slug = name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

        const brand = await prisma.brand.create({
            data: {
                name,
                slug,
                logo: logo || null
            }
        });

        console.log("✅ Marca creada:", brand.name);
        res.json(brand);
    } catch (error) {
        if (error.code === "P2002") {
            return res.status(400).json({ error: "Ya existe una marca con ese nombre" });
        }
        console.error("❌ Error al crear marca:", error);
        res.status(500).json({ error: "Error al crear marca" });
    }
});

/**
 * @swagger
 * /brands/{id}:
 *   put:
 *     summary: Actualiza una marca (admin)
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 */
router.put("/:id", authMiddleware, async (req, res) => {
    if (req.user.role !== "ADMIN") {
        return res.status(403).json({ error: "No autorizado" });
    }

    try {
        const id = Number(req.params.id);
        const { name, logo } = req.body;

        // Generar slug si cambió el nombre
        const slug = name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

        const brand = await prisma.brand.update({
            where: { id },
            data: {
                name,
                slug,
                logo: logo || null
            }
        });

        console.log("✅ Marca actualizada:", brand.name);
        res.json(brand);
    } catch (error) {
        if (error.code === "P2002") {
            return res.status(400).json({ error: "Ya existe una marca con ese nombre" });
        }
        console.error("❌ Error al actualizar marca:", error);
        res.status(500).json({ error: "Error al actualizar marca" });
    }
});

/**
 * @swagger
 * /brands/{id}:
 *   delete:
 *     summary: Elimina una marca (admin)
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", authMiddleware, async (req, res) => {
    if (req.user.role !== "ADMIN") {
        return res.status(403).json({ error: "No autorizado" });
    }

    try {
        const id = Number(req.params.id);

        // Verificar si hay productos asociados
        const productsCount = await prisma.product.count({
            where: { brandId: id }
        });

        if (productsCount > 0) {
            return res.status(400).json({
                error: `No se puede eliminar. Hay ${productsCount} producto(s) asociado(s) a esta marca`
            });
        }

        await prisma.brand.delete({
            where: { id }
        });

        console.log("✅ Marca eliminada:", id);
        res.json({ message: "Marca eliminada" });
    } catch (error) {
        console.error("❌ Error al eliminar marca:", error);
        res.status(500).json({ error: "Error al eliminar marca" });
    }
});

export default router;
