import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, adminOnly } from "../middleware/auth.js";

const prisma = new PrismaClient();
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payment Settings
 *   description: Configuración de opciones de pago
 */

/**
 * @swagger
 * /payment-settings:
 *   get:
 *     summary: Obtiene la configuración de pagos actual
 *     tags: [Payment Settings]
 *     responses:
 *       200:
 *         description: Configuración de pagos
 */
router.get("/", async (req, res) => {
    console.log('\n🔍 GET /payment-settings - Obtener configuración');

    try {
        // Obtener o crear la configuración (siempre hay solo un registro)
        let settings = await prisma.paymentSettings.findFirst();

        if (!settings) {
            // Si no existe, crear con valores por defecto
            settings = await prisma.paymentSettings.create({
                data: {
                    transferDiscount: 20,
                    installmentsCount: 3,
                    installmentsActive: true
                }
            });
            console.log('✅ Configuración creada con valores por defecto');
        }

        console.log(`✅ Configuración actual: ${settings.transferDiscount}% desc. transferencia, ${settings.installmentsCount} cuotas`);
        res.json(settings);
    } catch (error) {
        console.error('❌ Error al obtener configuración:', error);
        res.status(500).json({ error: 'Error al obtener configuración de pagos' });
    }
});

/**
 * @swagger
 * /payment-settings:
 *   put:
 *     summary: Actualiza la configuración de pagos (solo admin)
 *     tags: [Payment Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transferDiscount:
 *                 type: number
 *                 description: Porcentaje de descuento por transferencia (0-100)
 *               installmentsCount:
 *                 type: integer
 *                 description: Cantidad de cuotas sin interés
 *               installmentsActive:
 *                 type: boolean
 *                 description: Si las cuotas están activas
 *     responses:
 *       200:
 *         description: Configuración actualizada
 *       401:
 *         description: No autorizado
 */
router.put("/", authMiddleware, adminOnly, async (req, res) => {
    console.log('\n📝 PUT /payment-settings - Actualizar configuración');

    const { transferDiscount, installmentsCount, installmentsActive } = req.body;

    try {
        // Validaciones
        if (transferDiscount !== undefined) {
            if (transferDiscount < 0 || transferDiscount > 100) {
                return res.status(400).json({
                    error: 'El descuento por transferencia debe estar entre 0 y 100'
                });
            }
        }

        if (installmentsCount !== undefined) {
            if (installmentsCount < 1 || installmentsCount > 24) {
                return res.status(400).json({
                    error: 'La cantidad de cuotas debe estar entre 1 y 24'
                });
            }
        }

        // Obtener configuración existente o crear una nueva
        let settings = await prisma.paymentSettings.findFirst();

        const data = {};
        if (transferDiscount !== undefined) data.transferDiscount = transferDiscount;
        if (installmentsCount !== undefined) data.installmentsCount = installmentsCount;
        if (installmentsActive !== undefined) data.installmentsActive = installmentsActive;

        if (settings) {
            // Actualizar existente
            settings = await prisma.paymentSettings.update({
                where: { id: settings.id },
                data
            });
            console.log('✅ Configuración actualizada');
        } else {
            // Crear nueva
            settings = await prisma.paymentSettings.create({
                data: {
                    transferDiscount: transferDiscount || 20,
                    installmentsCount: installmentsCount || 3,
                    installmentsActive: installmentsActive !== undefined ? installmentsActive : true
                }
            });
            console.log('✅ Configuración creada');
        }

        console.log(`   📊 Nueva configuración: ${settings.transferDiscount}% desc., ${settings.installmentsCount} cuotas, activo: ${settings.installmentsActive}`);
        res.json(settings);
    } catch (error) {
        console.error('❌ Error al actualizar configuración:', error);
        res.status(500).json({ error: 'Error al actualizar configuración de pagos' });
    }
});

export default router;
