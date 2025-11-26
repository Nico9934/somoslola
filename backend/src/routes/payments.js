import express from 'express';
import { PrismaClient } from '@prisma/client';
import { createPayment } from '../services/mercadopago.js';

const router = express.Router();
const prisma = new PrismaClient();

// Procesar pago con Mercado Pago
router.post('/process', async (req, res) => {
    try {
        const { orderId, token, paymentMethodId, installments } = req.body;

        // Obtener orden
        const order = await prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            return res.status(404).json({ error: 'Orden no encontrada' });
        }

        // Crear pago en Mercado Pago
        const paymentResult = await createPayment({
            amount: order.total,
            token,
            description: `Pedido #${order.id}`,
            installments,
            paymentMethodId,
            email: order.email,
            firstName: order.customerName.split(' ')[0],
            lastName: order.customerName.split(' ').slice(1).join(' ') || 'Cliente',
        });

        console.log('Payment result:', paymentResult);

        // Actualizar orden según resultado
        if (paymentResult.status === 'approved') {
            await prisma.order.update({
                where: { id: orderId },
                data: {
                    status: 'PAID',
                    paymentId: paymentResult.id.toString(),
                    paymentStatus: paymentResult.status,
                },
            });

            return res.json({
                success: true,
                paymentId: paymentResult.id,
                status: paymentResult.status,
            });
        } else {
            // Actualizar con estado de pago rechazado/pendiente
            await prisma.order.update({
                where: { id: orderId },
                data: {
                    paymentId: paymentResult.id.toString(),
                    paymentStatus: paymentResult.status,
                },
            });

            return res.status(400).json({
                success: false,
                status: paymentResult.status,
                statusDetail: paymentResult.status_detail,
            });
        }
    } catch (error) {
        console.error('Error al procesar pago:', error);
        res.status(500).json({ error: 'Error al procesar el pago' });
    }
});

export default router;
