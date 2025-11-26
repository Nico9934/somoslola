import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, optionalAuth } from "../middleware/auth.js";
import {
    sendNewOrderEmailToAdmin,
    sendOrderConfirmationToCustomer,
    sendOrderStatusChangeToCustomer,
    sendPaymentProofUploadedToAdmin
} from "../services/email.js";

const prisma = new PrismaClient();
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Operaciones de checkout y gestión de pedidos
 */

/**
 * @swagger
 * /orders/calculate-shipping:
 *   post:
 *     summary: Calcula costo de envío según código postal
 *     tags: [Orders]
 */
router.post("/calculate-shipping", async (req, res) => {
    try {
        const { postalCode } = req.body;
        const cp = Number(postalCode);

        if (!cp) {
            return res.status(400).json({ error: "Código postal inválido" });
        }

        // Buscar zona de envío que coincida con el CP
        const zone = await prisma.shippingZone.findFirst({
            where: {
                OR: [
                    { cpStart: { lte: cp }, cpEnd: { gte: cp } },
                    { cpStart: null } // Interior del país (fallback)
                ]
            },
            orderBy: [
                { cpStart: 'asc' } // Priorizar zonas específicas sobre fallback
            ]
        });

        if (!zone) {
            // Fallback por si no hay zonas configuradas
            return res.json({ shippingCost: 6000 });
        }

        console.log(`📦 Costo de envío para CP ${cp}: $${zone.price} (${zone.name})`);
        return res.json({ shippingCost: zone.price });
    } catch (error) {
        console.error("❌ Error al calcular envío:", error);
        res.status(500).json({ error: "Error al calcular envío" });
    }
});

/**
 * @swagger
 * /orders/checkout:
 *   post:
 *     summary: Genera una orden desde carrito (guest o usuario)
 *     tags: [Orders]
 */
router.post("/checkout", optionalAuth, async (req, res) => {
    try {
        const userId = req.user?.id ?? null;
        const {
            cartId,
            email,
            customerName,
            customerPhone,
            shippingAddress,
            shippingNeighborhood,
            shippingCity,
            shippingState,
            shippingPostalCode,
            shippingCost,
            paymentMethod
        } = req.body;

        // Validaciones de campos requeridos
        if (!cartId || !email || !customerName || !customerPhone ||
            !shippingAddress || !shippingCity || !shippingState ||
            !shippingPostalCode || shippingCost === undefined || !paymentMethod) {
            return res.status(400).json({ error: "Faltan datos requeridos para el checkout" });
        }

        if (!["CARD", "TRANSFER"].includes(paymentMethod)) {
            return res.status(400).json({ error: "Método de pago inválido" });
        }

        // Obtener carrito con todos los datos necesarios para snapshot
        const cart = await prisma.cart.findUnique({
            where: { id: cartId },
            include: {
                items: {
                    include: {
                        variant: {
                            include: {
                                product: true,
                                images: true, // Para snapshot de imagen
                                stock: true,  // Incluir stock
                            },
                        },
                    },
                },
            },
        });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ error: "El carrito está vacío" });
        }

        // Validación final de stock definitivo
        for (const item of cart.items) {
            const availableStock = item.variant.stock?.quantity || 0;
            if (item.quantity > availableStock) {
                return res.status(400).json({
                    error: `Sin stock suficiente para SKU ${item.variant.sku}`,
                });
            }
        }

        // Calcular total de productos usando el precio final (con promoción si existe)
        const subtotal = cart.items.reduce(
            (sum, item) => {
                const finalPrice = item.variant.promotionPrice || item.variant.salePrice;
                return sum + finalPrice * item.quantity;
            },
            0
        );

        // Total final = subtotal + envío
        const total = subtotal + shippingCost;

        // Crear orden con snapshot de datos para preservar historial
        const order = await prisma.order.create({
            data: {
                userId,
                email,
                customerName,
                customerPhone,
                shippingAddress,
                shippingNeighborhood,
                shippingCity,
                shippingState,
                shippingPostalCode,
                shippingCost,
                paymentMethod,
                total,
                status: "PENDING",
                items: {
                    create: cart.items.map((item) => {
                        const finalPrice = item.variant.promotionPrice || item.variant.salePrice;
                        return {
                            variantId: item.variantId,
                            quantity: item.quantity,
                            price: finalPrice, // Guardar precio final (con promo si existe)
                            // 📸 Snapshot de datos para preservar información
                            productName: item.variant.product.name,
                            variantSku: item.variant.sku,
                            imageUrl: item.variant.images?.[0]?.url || null,
                            attributes: item.variant.attributes || {},
                        };
                    }),
                },
            },
            include: { items: true },
        });

        // Vaciar carrito (el stock se descuenta cuando se confirma el pedido)
        await prisma.cartItem.deleteMany({ where: { cartId } });

        console.log("✅ Orden creada exitosamente:", order.id, "- Total:", total, "- Método:", paymentMethod);

        // Enviar emails de notificación
        await sendNewOrderEmailToAdmin(order);
        await sendOrderConfirmationToCustomer(order);

        return res.json({ message: "Orden creada exitosamente", order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al procesar checkout" });
    }
});

/**
 * @swagger
 * /orders/my-orders:
 *   get:
 *     summary: Obtiene las órdenes del usuario autenticado
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 */
router.get("/my-orders", authMiddleware, async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: { userId: req.user.id },
            include: {
                items: true,
            },
            orderBy: { createdAt: "desc" },
        });

        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener pedidos" });
    }
});

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Obtiene una orden del usuario autenticado
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id", authMiddleware, async (req, res) => {
    const id = Number(req.params.id);

    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            items: {
                include: {
                    variant: {
                        include: { product: true },
                    },
                },
            },
        },
    });

    if (!order || order.userId !== req.user.id) {
        return res.status(404).json({ error: "Orden no encontrada" });
    }

    res.json(order);
});

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Lista todas las órdenes (solo admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 */
router.get("/", authMiddleware, async (req, res) => {
    if (req.user.role !== "ADMIN") {
        return res.status(403).json({ error: "No autorizado" });
    }

    const orders = await prisma.order.findMany({
        include: {
            items: {
                include: {
                    variant: {
                        include: {
                            product: true,
                            images: true,
                        },
                    },
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    res.json(orders);
});

/**
 * @swagger
 * /orders/{id}/status:
 *   put:
 *     summary: Actualiza el estado de una orden (solo admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 */
router.put("/:id/status", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "ADMIN") {
            return res.status(403).json({ error: "No autorizado" });
        }

        const id = Number(req.params.id);
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: "Estado requerido" });
        }

        // Validar que el estado sea válido (debe coincidir con el enum OrderStatus)
        const validStatuses = ["PENDING", "PAID", "SHIPPED", "COMPLETED", "CANCELLED"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: "Estado inválido" });
        }

        // Obtener orden actual con items
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                items: true,
            },
        });

        if (!order) {
            return res.status(404).json({ error: "Orden no encontrada" });
        }

        console.log(`📦 Orden #${id}: Estado actual: ${order.status} → Nuevo estado: ${status}`);

        // Si el estado cambia de PENDING a PAID (transferencia confirmada) → descontar stock
        const shouldDecrementStock =
            order.status === "PENDING" &&
            status === "PAID";

        console.log(`¿Descontar stock? ${shouldDecrementStock}`);

        if (shouldDecrementStock) {
            // Descontar stock de cada item
            for (const item of order.items) {
                console.log(`📦 Item: ${item.variantSku}, variantId: ${item.variantId}, cantidad: ${item.quantity}`);

                if (!item.variantId) {
                    console.warn(`⚠️ Item ${item.id} no tiene variantId, saltando...`);
                    continue;
                }

                const stockRecord = await prisma.stock.findUnique({
                    where: { variantId: item.variantId },
                });

                if (stockRecord) {
                    // Validar que haya stock suficiente
                    if (stockRecord.quantity < item.quantity) {
                        return res.status(400).json({
                            error: `Stock insuficiente para ${item.variantSku}. Disponible: ${stockRecord.quantity}, Requerido: ${item.quantity}`,
                        });
                    }

                    await prisma.stock.update({
                        where: { variantId: item.variantId },
                        data: { quantity: { decrement: item.quantity } },
                    });
                    console.log(`✅ Stock descontado: ${item.variantSku} (-${item.quantity})`);
                } else {
                    console.warn(`⚠️ No existe registro de Stock para variantId ${item.variantId}`);
                }
            }
            console.log(`✅ Stock descontado para orden #${id}`);
        }

        // Si se cancela y ya estaba confirmado/pagado → devolver stock
        const shouldIncrementStock =
            (order.status === "PAID" || order.status === "SHIPPED") &&
            status === "CANCELLED";

        console.log(`¿Devolver stock? ${shouldIncrementStock}`);

        if (shouldIncrementStock) {
            for (const item of order.items) {
                const stockRecord = await prisma.stock.findUnique({
                    where: { variantId: item.variantId },
                });

                if (stockRecord) {
                    await prisma.stock.update({
                        where: { variantId: item.variantId },
                        data: { quantity: { increment: item.quantity } },
                    });
                }
            }
            console.log(`✅ Stock devuelto para orden cancelada #${id}`);
        }

        // Actualizar estado
        const updatedOrder = await prisma.order.update({
            where: { id },
            data: { status },
            include: { items: true },
        });

        // Notificar al cliente del cambio de estado
        await sendOrderStatusChangeToCustomer(updatedOrder, status);

        res.json(updatedOrder);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar estado" });
    }
});

/**
 * @swagger
 * /orders/{id}/payment-proof:
 *   post:
 *     summary: Sube el comprobante de pago para una orden (TRANSFER)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 */
router.post("/:id/payment-proof", authMiddleware, async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { paymentProof } = req.body;

        if (!paymentProof) {
            return res.status(400).json({ error: "URL del comprobante requerida" });
        }

        // Verificar que la orden existe y pertenece al usuario
        const order = await prisma.order.findUnique({
            where: { id },
        });

        if (!order) {
            return res.status(404).json({ error: "Orden no encontrada" });
        }

        if (order.userId !== req.user.id) {
            return res.status(403).json({ error: "No autorizado" });
        }

        if (order.paymentMethod !== "TRANSFER") {
            return res.status(400).json({ error: "Solo para órdenes con transferencia" });
        }

        // Actualizar orden con el comprobante
        const updatedOrder = await prisma.order.update({
            where: { id },
            data: { paymentProof },
        });

        console.log(`📄 Comprobante subido para orden #${id}`);

        // Notificar al admin
        await sendPaymentProofUploadedToAdmin(updatedOrder);

        res.json({ message: "Comprobante subido exitosamente", order: updatedOrder });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al subir comprobante" });
    }
});

export default router;
