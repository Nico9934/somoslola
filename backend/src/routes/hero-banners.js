import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";

const prisma = new PrismaClient();
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: HeroBanners
 *   description: Gestión de banners del hero
 */

/**
 * @swagger
 * /hero-banners:
 *   get:
 *     summary: Lista todos los banners activos
 *     tags: [HeroBanners]
 */
router.get("/", async (req, res) => {
    try {
        const { includeInactive } = req.query;

        const where = includeInactive === 'true' ? {} : { isActive: true };

        const banners = await prisma.heroBanner.findMany({
            where,
            orderBy: { order: 'asc' }
        });

        res.json(banners);
    } catch (error) {
        console.error("❌ Error al obtener banners:", error);
        res.status(500).json({ error: "Error al obtener banners" });
    }
});

/**
 * @swagger
 * /hero-banners/{id}:
 *   get:
 *     summary: Obtiene un banner por ID
 *     tags: [HeroBanners]
 */
router.get("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const banner = await prisma.heroBanner.findUnique({
            where: { id }
        });

        if (!banner) {
            return res.status(404).json({ error: "Banner no encontrado" });
        }

        res.json(banner);
    } catch (error) {
        console.error("❌ Error al obtener banner:", error);
        res.status(500).json({ error: "Error al obtener banner" });
    }
});

/**
 * @swagger
 * /hero-banners:
 *   post:
 *     summary: Crea un nuevo banner (admin)
 *     tags: [HeroBanners]
 *     security:
 *       - bearerAuth: []
 */
router.post("/", authMiddleware, async (req, res) => {
    if (req.user.role !== "ADMIN") {
        return res.status(403).json({ error: "No autorizado" });
    }

    try {
        const { title, subtitle, imageUrl, link, order, isActive } = req.body;

        if (!imageUrl) {
            return res.status(400).json({ error: "La imagen es requerida" });
        }

        const banner = await prisma.heroBanner.create({
            data: {
                title,
                subtitle: subtitle || null,
                imageUrl,
                link: link || null,
                order: order !== undefined ? Number(order) : 0,
                isActive: isActive !== undefined ? isActive : true
            }
        });

        console.log("✅ Banner creado:", banner.title);
        res.json(banner);
    } catch (error) {
        console.error("❌ Error al crear banner:", error);
        res.status(500).json({ error: "Error al crear banner" });
    }
});

/**
 * @swagger
 * /hero-banners/{id}:
 *   put:
 *     summary: Actualiza un banner (admin)
 *     tags: [HeroBanners]
 *     security:
 *       - bearerAuth: []
 */
router.put("/:id", authMiddleware, async (req, res) => {
    if (req.user.role !== "ADMIN") {
        return res.status(403).json({ error: "No autorizado" });
    }

    try {
        const id = Number(req.params.id);
        const { title, subtitle, imageUrl, link, order, isActive } = req.body;

        const banner = await prisma.heroBanner.update({
            where: { id },
            data: {
                title,
                subtitle: subtitle || null,
                imageUrl,
                link: link || null,
                order: order !== undefined ? Number(order) : undefined,
                isActive: isActive !== undefined ? isActive : undefined
            }
        });

        console.log("✅ Banner actualizado:", banner.title);
        res.json(banner);
    } catch (error) {
        console.error("❌ Error al actualizar banner:", error);
        res.status(500).json({ error: "Error al actualizar banner" });
    }
});

/**
 * @swagger
 * /hero-banners/{id}:
 *   delete:
 *     summary: Elimina un banner (admin)
 *     tags: [HeroBanners]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", authMiddleware, async (req, res) => {
    if (req.user.role !== "ADMIN") {
        return res.status(403).json({ error: "No autorizado" });
    }

    try {
        const id = Number(req.params.id);

        await prisma.heroBanner.delete({
            where: { id }
        });

        console.log("✅ Banner eliminado:", id);
        res.json({ message: "Banner eliminado" });
    } catch (error) {
        console.error("❌ Error al eliminar banner:", error);
        res.status(500).json({ error: "Error al eliminar banner" });
    }
});

export default router;
