import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, adminOnly } from "../middleware/auth.js";

const prisma = new PrismaClient();
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Stock Notifications
 *   description: Gestión de notificaciones de stock
 */

/* -------------------------------------------------------
   📬 POST /stock-notifications - Crear notificación (público/autenticado)
------------------------------------------------------- */
/**
 * @swagger
 * /stock-notifications:
 *   post:
 *     summary: Solicitar notificación cuando una variante tenga stock
 *     tags: [Stock Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - variantId
 *             properties:
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               variantId:
 *                 type: integer
 *     responses:
 *       201: { description: Notificación creada }
 */
router.post("/", async (req, res) => {
    console.log('📬 === INICIO CREAR NOTIFICACIÓN DE STOCK ===');

    try {
        const { email, name, phone, variantId } = req.body;

        // Validaciones
        if (!email || !variantId) {
            return res.status(400).json({ error: "Email y variantId son requeridos" });
        }

        // Verificar si la variante existe
        const variant = await prisma.productVariant.findUnique({
            where: { id: variantId },
            include: { product: true }
        });

        if (!variant) {
            return res.status(404).json({ error: "Variante no encontrada" });
        }

        // Obtener userId si está autenticado
        let userId = null;
        if (req.user) {
            userId = req.user.userId;
        }

        // Verificar si ya existe una notificación pendiente para este email y variante
        const existingNotification = await prisma.stockNotification.findFirst({
            where: {
                email,
                variantId,
                status: { in: ['PENDING', 'NOTIFIED', 'CONTACTED'] }
            }
        });

        if (existingNotification) {
            return res.status(400).json({
                error: "Ya existe una solicitud de notificación activa para este producto"
            });
        }

        // Crear notificación
        const notification = await prisma.stockNotification.create({
            data: {
                userId,
                email,
                name,
                phone,
                variantId,
                productId: variant.productId,
                status: 'PENDING'
            },
            include: {
                variant: {
                    include: {
                        product: true,
                        attributeValues: {
                            include: {
                                attributeValue: {
                                    include: { attribute: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        console.log('✅ Notificación creada:', notification.id);
        console.log('📬 === FIN CREAR NOTIFICACIÓN DE STOCK ===\n');

        res.status(201).json({
            message: "Te avisaremos cuando tengamos stock disponible",
            notification
        });
    } catch (error) {
        console.error('❌ Error al crear notificación:', error);
        console.log('📬 === FIN CREAR NOTIFICACIÓN DE STOCK ===\n');
        res.status(500).json({ error: "Error al crear notificación" });
    }
});

/* -------------------------------------------------------
   📋 GET /stock-notifications - Listar notificaciones (ADMIN)
------------------------------------------------------- */
/**
 * @swagger
 * /stock-notifications:
 *   get:
 *     summary: Obtener todas las notificaciones de stock
 *     tags: [Stock Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, NOTIFIED, CONTACTED, ORDERED, CANCELLED]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200: { description: Lista de notificaciones }
 */
router.get("/", authMiddleware, adminOnly, async (req, res) => {
    console.log('📋 === INICIO LISTAR NOTIFICACIONES ===');

    try {
        const { status, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (status) {
            where.status = status;
        }

        const [notifications, total] = await Promise.all([
            prisma.stockNotification.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: { id: true, email: true }
                    },
                    variant: {
                        include: {
                            product: true,
                            stock: true,
                            attributeValues: {
                                include: {
                                    attributeValue: {
                                        include: { attribute: true }
                                    }
                                }
                            }
                        }
                    }
                }
            }),
            prisma.stockNotification.count({ where })
        ]);

        console.log(`✅ Encontradas ${notifications.length} notificaciones`);
        console.log('📋 === FIN LISTAR NOTIFICACIONES ===\n');

        res.json({
            notifications,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('❌ Error al listar notificaciones:', error);
        console.log('📋 === FIN LISTAR NOTIFICACIONES ===\n');
        res.status(500).json({ error: "Error al listar notificaciones" });
    }
});

/* -------------------------------------------------------
   ✏️ PATCH /stock-notifications/:id - Actualizar notificación (ADMIN)
------------------------------------------------------- */
/**
 * @swagger
 * /stock-notifications/{id}:
 *   patch:
 *     summary: Actualizar estado de una notificación
 *     tags: [Stock Notifications]
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
 *               status:
 *                 type: string
 *                 enum: [PENDING, NOTIFIED, CONTACTED, ORDERED, CANCELLED]
 *               notes:
 *                 type: string
 *     responses:
 *       200: { description: Notificación actualizada }
 */
router.patch("/:id", authMiddleware, adminOnly, async (req, res) => {
    console.log('✏️ === INICIO ACTUALIZAR NOTIFICACIÓN ===');

    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        const updateData = {};
        if (status) updateData.status = status;
        if (notes !== undefined) updateData.notes = notes;
        if (status === 'NOTIFIED' || status === 'CONTACTED') {
            updateData.notifiedAt = new Date();
        }

        const notification = await prisma.stockNotification.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: {
                variant: {
                    include: {
                        product: true,
                        attributeValues: {
                            include: {
                                attributeValue: {
                                    include: { attribute: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        console.log('✅ Notificación actualizada:', notification.id);
        console.log('✏️ === FIN ACTUALIZAR NOTIFICACIÓN ===\n');

        res.json(notification);
    } catch (error) {
        console.error('❌ Error al actualizar notificación:', error);
        console.log('✏️ === FIN ACTUALIZAR NOTIFICACIÓN ===\n');
        res.status(500).json({ error: "Error al actualizar notificación" });
    }
});

/* -------------------------------------------------------
   🗑️ DELETE /stock-notifications/:id - Eliminar notificación (ADMIN)
------------------------------------------------------- */
router.delete("/:id", authMiddleware, adminOnly, async (req, res) => {
    console.log('🗑️ === INICIO ELIMINAR NOTIFICACIÓN ===');

    try {
        const { id } = req.params;

        await prisma.stockNotification.delete({
            where: { id: parseInt(id) }
        });

        console.log('✅ Notificación eliminada:', id);
        console.log('🗑️ === FIN ELIMINAR NOTIFICACIÓN ===\n');

        res.json({ message: "Notificación eliminada" });
    } catch (error) {
        console.error('❌ Error al eliminar notificación:', error);
        console.log('🗑️ === FIN ELIMINAR NOTIFICACIÓN ===\n');
        res.status(500).json({ error: "Error al eliminar notificación" });
    }
});

/* -------------------------------------------------------
   📊 GET /stock-notifications/stats - Estadísticas (ADMIN)
------------------------------------------------------- */
router.get("/stats", authMiddleware, adminOnly, async (req, res) => {
    console.log('📊 === INICIO ESTADÍSTICAS DE NOTIFICACIONES ===');

    try {
        const stats = await prisma.stockNotification.groupBy({
            by: ['status'],
            _count: true
        });

        const formattedStats = stats.reduce((acc, curr) => {
            acc[curr.status] = curr._count;
            return acc;
        }, {});

        console.log('✅ Estadísticas calculadas');
        console.log('📊 === FIN ESTADÍSTICAS DE NOTIFICACIONES ===\n');

        res.json(formattedStats);
    } catch (error) {
        console.error('❌ Error al calcular estadísticas:', error);
        console.log('📊 === FIN ESTADÍSTICAS DE NOTIFICACIONES ===\n');
        res.status(500).json({ error: "Error al calcular estadísticas" });
    }
});

export default router;
