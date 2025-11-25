import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";

const prisma = new PrismaClient();
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: ShippingZones
 *   description: Gestión de zonas de envío
 */

/**
 * @swagger
 * /shipping-zones:
 *   get:
 *     summary: Lista todas las zonas de envío
 *     tags: [ShippingZones]
 */
router.get("/", async (req, res) => {
    try {
        const zones = await prisma.shippingZone.findMany({
            orderBy: [
                { cpStart: 'asc' }
            ]
        });
        res.json(zones);
    } catch (error) {
        console.error("❌ Error al obtener zonas:", error);
        res.status(500).json({ error: "Error al obtener zonas de envío" });
    }
});

/**
 * @swagger
 * /shipping-zones:
 *   post:
 *     summary: Crea una nueva zona de envío (admin)
 *     tags: [ShippingZones]
 *     security:
 *       - bearerAuth: []
 */
router.post("/", authMiddleware, async (req, res) => {
    if (req.user.role !== "ADMIN") {
        return res.status(403).json({ error: "No autorizado" });
    }

    try {
        const { name, cpStart, cpEnd, price } = req.body;

        if (!name || price === undefined) {
            return res.status(400).json({ error: "Nombre y precio son requeridos" });
        }

        const zone = await prisma.shippingZone.create({
            data: {
                name,
                cpStart: cpStart || null,
                cpEnd: cpEnd || null,
                price: Number(price)
            }
        });

        console.log("✅ Zona de envío creada:", zone.name);
        res.json(zone);
    } catch (error) {
        console.error("❌ Error al crear zona:", error);
        res.status(500).json({ error: "Error al crear zona de envío" });
    }
});

/**
 * @swagger
 * /shipping-zones/{id}:
 *   put:
 *     summary: Actualiza una zona de envío (admin)
 *     tags: [ShippingZones]
 *     security:
 *       - bearerAuth: []
 */
router.put("/:id", authMiddleware, async (req, res) => {
    if (req.user.role !== "ADMIN") {
        return res.status(403).json({ error: "No autorizado" });
    }

    try {
        const id = Number(req.params.id);
        const { name, cpStart, cpEnd, price } = req.body;

        const zone = await prisma.shippingZone.update({
            where: { id },
            data: {
                name,
                cpStart: cpStart || null,
                cpEnd: cpEnd || null,
                price: Number(price)
            }
        });

        console.log("✅ Zona de envío actualizada:", zone.name);
        res.json(zone);
    } catch (error) {
        console.error("❌ Error al actualizar zona:", error);
        res.status(500).json({ error: "Error al actualizar zona de envío" });
    }
});

/**
 * @swagger
 * /shipping-zones/{id}:
 *   delete:
 *     summary: Elimina una zona de envío (admin)
 *     tags: [ShippingZones]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", authMiddleware, async (req, res) => {
    if (req.user.role !== "ADMIN") {
        return res.status(403).json({ error: "No autorizado" });
    }

    try {
        const id = Number(req.params.id);

        await prisma.shippingZone.delete({
            where: { id }
        });

        console.log("✅ Zona de envío eliminada:", id);
        res.json({ message: "Zona de envío eliminada" });
    } catch (error) {
        console.error("❌ Error al eliminar zona:", error);
        res.status(500).json({ error: "Error al eliminar zona de envío" });
    }
});

export default router;
